import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Check, Eye, FileText, Hourglass, Inbox, ListChecks, Search, Trash2, X } from 'lucide-react';
import ActionMenu from '../../components/ActionMenu';
import Avatar, { PersonCell } from '../../components/Avatar';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import FormModal from '../../components/FormModal';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { api, fileUrl, withQuery } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useAction } from '../../hooks/useAction';
import { useApi, useLookups } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { tweenFrom, tweenTo, usePresence } from '../../lib/animate';
import { formatDate, formatTime } from '../../utils/dateUtils';

const period = (row) => (row.startDate === row.endDate ? formatDate(row.startDate) : `${formatDate(row.startDate)} – ${formatDate(row.endDate)}`);

// Employees apply for leave without a type; HR picks it when approving.
const typeLabel = (row) => row.leaveType ?? 'Leave (type not set)';

const durationLabel = (row) => {
  if (row.category === 'Permission') return `${formatTime(row.startTime)} – ${formatTime(row.endTime)}`;
  return row.duration === 'Full Day' ? `${row.days} day${row.days === 1 ? '' : 's'}` : row.duration;
};

function drawerIn(el) {
  const [overlay, panel] = el.children;
  return gsap
    .timeline()
    .add(tweenFrom(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 }), 0)
    .add(tweenFrom(panel, { x: '100%' }, { x: '0%', duration: 0.28, ease: 'power2.out' }), 0);
}

function drawerOut(el, onComplete) {
  const [overlay, panel] = el.children;
  return gsap
    .timeline({ onComplete })
    .add(tweenTo(overlay, { autoAlpha: 0, duration: 0.15 }), 0)
    .add(tweenTo(panel, { x: '100%', duration: 0.2, ease: 'power2.in' }), 0);
}

/** Right slide-over drawer for pending requests. */
function RequestsDrawer({ open, onClose, title, count, children }) {
  const [mounted, containerRef] = usePresence(open, drawerIn, drawerOut);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      // If an overlay modal (e.g. approve/reject FormModal) is open on top, don't close the drawer
      const topModal = document.querySelector('[role="dialog"][aria-modal="true"]:not([data-drawer])');
      if (topModal) return;
      onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div ref={containerRef} className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        data-drawer="true"
        className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl border-l border-line"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Inbox size={20} aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-ink">{title}</h2>
                {count > 0 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold-400 px-1.5 text-xs font-bold text-brand-900">
                    {count}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">Review and take action on pending requests</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn h-9 w-9 rounded-xl hover:bg-brand-50 text-muted hover:text-brand-700"
            aria-label="Close drawer"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-canvas/40">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}

/** Approval queue shared by Leave Requests and Work From Home. */
export default function LeaveQueue({ category, module, title, description, subCategoryFilter = false }) {
  const { can } = useAuth();
  const toast = useToast();
  const canManage = can(module, 'manage');
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(() => searchParams.get('drawer') === 'true');

  useEffect(() => {
    if (searchParams.get('drawer') === 'true') {
      setDrawerOpen(true);
    }
  }, [searchParams]);

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    if (searchParams.get('drawer') === 'true') {
      const next = new URLSearchParams(searchParams);
      next.delete('drawer');
      setSearchParams(next, { replace: true });
    }
  };
  const [drawerSearch, setDrawerSearch] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [viewing, setViewing] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [approving, setApproving] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { busy, run } = useAction();
  const { leaveTypes = [] } = useLookups(category === 'WFH' ? null : 'leaveTypes');

  useEffect(() => {
    const id = setTimeout(() => setQuery(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  // Main table displays Approved & Rejected (Processed) requests by default
  const { data, loading, error, reload } = useApi(withQuery('/leaves', { category, status: 'Processed', q: query, ...filters }));
  // Pending requests for the Requests right-sidebar drawer
  const { data: pendingData, loading: pendingLoading, reload: reloadPending } = useApi(`/leaves?category=${category}&status=Pending`);

  const refresh = () => {
    reload();
    reloadPending();
  };

  const approve = async (row) => {
    // A leave needs its type before approval; permission and WFH approve straight away.
    if (row.category === 'Leave') return setApproving(row);
    if (await run(() => api.put(`/leaves/${row._id}/status`, { status: 'Approved' }), { success: 'Approved', successMessage: `${row.employee?.name} has been notified.` })) refresh();
  };

  const columns = useMemo(
    () => [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      { key: 'employee', header: 'Employee Name', render: (row) => <PersonCell name={row.employee?.name ?? '—'} subtitle={`${row.employee?.employeeId ?? ''} · ${row.employee?.department?.name ?? ''}`} /> },
      { key: 'type', header: 'Type', render: (row) => (row.leaveType ? row.leaveType : <span className="text-muted">{typeLabel(row)}</span>) },
      { key: 'period', header: 'Period', className: 'whitespace-nowrap', render: period },
      { key: 'duration', header: 'Duration', className: 'whitespace-nowrap', render: durationLabel },
      { key: 'reason', header: 'Reason', className: 'max-w-[220px] truncate text-muted', render: (row) => row.reason },
      { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            {canManage && row.status === 'Pending' && (
              <>
                <button type="button" className="icon-btn h-9 w-9 text-green-700 hover:bg-green-50 hover:text-green-700" aria-label={`Approve request from ${row.employee?.name}`} title="Approve" onClick={() => approve(row)}>
                  <Check size={18} aria-hidden="true" />
                </button>
                <button type="button" className="icon-btn h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-600" aria-label={`Reject request from ${row.employee?.name}`} title="Reject" onClick={() => setRejecting(row)}>
                  <X size={18} aria-hidden="true" />
                </button>
              </>
            )}
            <ActionMenu
              label="More actions"
              items={[
                { label: 'View details', icon: Eye, onClick: () => setViewing(row) },
                ...(canManage ? [{ label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => setDeleting(row) }] : []),
              ]}
            />
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage],
  );

  const filterConfig = [
    ...(subCategoryFilter ? [{ key: 'subCategory', label: 'Type', type: 'select', options: ['Leave', 'Permission'], allLabel: 'Leave & permission' }] : []),
    { key: 'from', label: 'From', type: 'date' },
    { key: 'to', label: 'To', type: 'date' },
  ];

  const pendingItems = useMemo(() => {
    const list = pendingData?.items ?? [];
    if (!drawerSearch.trim()) return list;
    const term = drawerSearch.toLowerCase();
    return list.filter(
      (item) =>
        item.employee?.name?.toLowerCase().includes(term) ||
        item.employee?.employeeId?.toLowerCase().includes(term) ||
        item.reason?.toLowerCase().includes(term) ||
        item.leaveType?.toLowerCase().includes(term),
    );
  }, [pendingData?.items, drawerSearch]);

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {category === 'Leave' && (
              <>
                <Link to="/admin/leave-options" className="btn btn-secondary">
                  Leave Option
                </Link>
                <Link to="/admin/leave-types" className="btn btn-secondary">
                  Leave Type
                </Link>
              </>
            )}
            <button
              type="button"
              className="btn btn-primary relative inline-flex items-center gap-2"
              onClick={() => setDrawerOpen(true)}
            >
              <Inbox size={17} aria-hidden="true" />
              <span>Requests</span>
              {(pendingData?.total ?? 0) > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold-400 px-1.5 text-xs font-bold text-brand-900 shadow-sm">
                  {pendingData.total}
                </span>
              )}
            </button>
          </div>
        }
      />

      <section className="card overflow-hidden">
        <FilterBar
          idPrefix={`queue-${category}`}
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search by employee…"
          filters={filterConfig}
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        />
        <DataTable
          columns={columns}
          rows={data?.items}
          loading={loading}
          error={error}
          onRetry={reload}
          itemLabel="requests"
          caption={title}
          empty={{
            title: 'No processed requests',
            description: 'Approved and rejected requests will appear here.',
          }}
        />
      </section>

      {/* Requests Right Sidebar / Slide-Over Drawer */}
      <RequestsDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        title="Requests"
        count={pendingData?.total ?? 0}
      >
        {pendingLoading && !pendingData ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="p-4 sm:p-5 space-y-3.5">
            {(pendingData?.items?.length ?? 0) > 2 && (
              <div className="relative mb-3">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search requests by name or reason…"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white py-2 pl-9 pr-3 text-xs text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            )}

            {pendingItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 mb-3">
                  <ListChecks size={28} />
                </div>
                <h3 className="text-sm font-bold text-ink">No pending requests</h3>
                <p className="mt-1 max-w-xs text-xs text-muted">
                  All requests have been reviewed and processed. New incoming requests will appear here.
                </p>
              </div>
            ) : (
              pendingItems.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-line bg-white p-4 shadow-sm transition-all hover:border-brand-300 hover:shadow"
                >
                  {/* Employee & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={item.employee?.name} photo={item.employee?.photo} size="sm" />
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-ink truncate leading-tight">
                          {item.employee?.name ?? '—'}
                        </h4>
                        <p className="text-[11px] text-muted truncate mt-0.5">
                          {item.employee?.employeeId}{item.employee?.department?.name ? ` · ${item.employee?.department?.name}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2.5 py-0.5 text-[11px] font-semibold text-gold-700 border border-gold-200 shrink-0">
                      <Hourglass size={11} />
                      Pending
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-canvas p-2 border border-line/60">
                      <span className="text-muted block text-[10px] font-medium uppercase tracking-wider">Type</span>
                      <span className="font-semibold text-ink mt-0.5 block truncate">
                        {item.category === 'Leave' ? (item.leaveType || 'Leave') : item.category}
                      </span>
                    </div>
                    <div className="rounded-xl bg-canvas p-2 border border-line/60">
                      <span className="text-muted block text-[10px] font-medium uppercase tracking-wider">Duration</span>
                      <span className="font-semibold text-ink mt-0.5 block truncate">
                        {durationLabel(item)}
                      </span>
                    </div>
                    <div className="col-span-2 rounded-xl bg-canvas p-2 border border-line/60">
                      <span className="text-muted block text-[10px] font-medium uppercase tracking-wider">Period</span>
                      <span className="font-semibold text-ink mt-0.5 block">
                        {period(item)}
                      </span>
                    </div>
                  </div>

                  {/* Reason */}
                  {item.reason && (
                    <div className="mt-2.5 rounded-xl bg-canvas/70 p-2.5 text-xs text-ink/90 border border-line/50">
                      <span className="text-muted font-medium block text-[10px] uppercase tracking-wider mb-0.5">Reason</span>
                      <p className="leading-relaxed whitespace-pre-wrap text-xs">{item.reason}</p>
                    </div>
                  )}

                  {/* Attachment */}
                  {item.attachment && (
                    <a
                      href={fileUrl(item.attachment.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline"
                    >
                      <FileText size={13} />
                      <span>Attachment: {item.attachment.name}</span>
                    </a>
                  )}

                  {/* Action buttons */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-line/60 pt-3">
                    <button
                      type="button"
                      onClick={() => setViewing(item)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-brand-700 transition-colors"
                    >
                      <Eye size={14} />
                      Details
                    </button>

                    {canManage && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRejecting(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100/70 transition-colors"
                        >
                          <X size={14} />
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => approve(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700 active:scale-95 transition-all"
                        >
                          <Check size={14} />
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </RequestsDrawer>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title="Request details" description={viewing?.employee?.name} size="md">
        {viewing && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ['Type', typeLabel(viewing)],
              ['Status', <StatusBadge key="status" value={viewing.status} />],
              ['Period', period(viewing)],
              ['Duration', durationLabel(viewing)],
              ['Applied by', viewing.createdBy === 'admin' ? 'Admin' : 'Employee'],
              ['Decided by', viewing.decidedBy ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-line p-3">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
              </div>
            ))}
            <div className="rounded-xl border border-line p-3 sm:col-span-2">
              <dt className="text-xs text-muted">Reason</dt>
              <dd className="mt-0.5 text-sm text-ink">{viewing.reason}</dd>
            </div>
            {viewing.note && (
              <div className="rounded-xl border border-line p-3 sm:col-span-2">
                <dt className="text-xs text-muted">Note</dt>
                <dd className="mt-0.5 text-sm text-ink">{viewing.note}</dd>
              </div>
            )}
            {viewing.attachment && (
              <a href={fileUrl(viewing.attachment.url)} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-700 hover:underline sm:col-span-2">
                View attachment: {viewing.attachment.name}
              </a>
            )}
          </dl>
        )}
      </Modal>

      <FormModal
        open={Boolean(approving)}
        onClose={() => setApproving(null)}
        title="Approve this leave"
        description={approving ? `${approving.employee?.name} · ${period(approving)} · ${durationLabel(approving)}` : ''}
        size="sm"
        fields={[
          { name: 'leaveType', label: 'Leave type', type: 'select', required: true, span: 2, options: leaveTypes.map((t) => t.name), hint: 'Decides whether these days are paid or counted as LOP.' },
        ]}
        initialValues={{ leaveType: approving?.leaveType ?? '' }}
        submitLabel="Approve"
        onSubmit={async ({ leaveType }) => {
          await api.put(`/leaves/${approving._id}/status`, { status: 'Approved', leaveType });
          toast.success('Approved', `${approving.employee?.name} has been notified.`);
          setApproving(null);
          refresh();
        }}
      />

      <FormModal
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title="Reject this request?"
        description={rejecting?.employee?.name}
        size="sm"
        fields={[{ name: 'note', label: 'Reason', type: 'textarea', required: true, hint: 'The employee sees this.' }]}
        initialValues={{}}
        submitLabel="Reject"
        onSubmit={async ({ note }) => {
          await api.put(`/leaves/${rejecting._id}/status`, { status: 'Rejected', note });
          toast.info('Request rejected');
          setRejecting(null);
          refresh();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this request?"
        message="It will be removed from the employee’s history too. This can’t be undone."
        confirmLabel="Delete"
        loading={busy}
        onConfirm={async () => {
          if (await run(() => api.del(`/leaves/${deleting._id}`), { success: 'Request deleted' })) {
            setDeleting(null);
            refresh();
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
