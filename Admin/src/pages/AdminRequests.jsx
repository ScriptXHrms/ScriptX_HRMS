import { useEffect, useMemo, useState } from 'react';
import { Check, Eye, Trash2, X } from 'lucide-react';
import ActionMenu from '../components/ActionMenu';
import { PersonCell } from '../components/Avatar';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import FormModal from '../components/FormModal';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { api, withQuery } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { REQUEST_SUBJECTS } from '../data/constants';
import { useAction } from '../hooks/useAction';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { formatDate, formatTime } from '../utils/dateUtils';

const subjectOf = (row) => (row.subject === 'Other' ? row.customSubject : row.subject);
const datesOf = (row) => (row.toDate && row.toDate !== row.fromDate ? `${formatDate(row.fromDate)} – ${formatDate(row.toDate)}` : formatDate(row.fromDate));
// Pieces that each stay on one line, so a tight Subject column wraps between them.
const shiftLine = (row) => [formatDate(row.fromDate), row.toDate && row.toDate !== row.fromDate && `– ${formatDate(row.toDate)}`, row.shift && `· ${row.shift.name}`].filter(Boolean);
function timingOf(row) {
  const from = row.startTime || row.shift?.from;
  const to = row.endTime || row.shift?.to;
  return from && to ? `${formatTime(from)} – ${formatTime(to)}` : null;
}

export default function AdminRequests() {
  const { can } = useAuth();
  const toast = useToast();
  const canManage = can('requests', 'manage');
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { busy, run } = useAction();
  const { data, loading, error, reload } = useApi(withQuery('/requests', { ...filters, q: query }));

  useEffect(() => {
    const id = setTimeout(() => setQuery(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  const columns = useMemo(() => {
    const approve = async (row) => {
      if (await run(() => api.put(`/requests/${row._id}/status`, { status: 'Approved' }), { success: 'Request approved' })) reload();
    };
    return [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      { key: 'name', header: 'Name', render: (row) => <PersonCell name={row.employee?.name ?? '—'} subtitle={row.employee?.employeeId} /> },
      { key: 'date', header: 'Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.date) },
      {
        key: 'subject',
        header: 'Subject',
        render: (row) => (
          <>
            <p>{subjectOf(row)}</p>
            {row.subject === 'Shift' && row.fromDate && (
              <p className="mt-0.5 flex flex-wrap gap-x-1 text-xs text-muted">
                {shiftLine(row).map((part) => (
                  <span key={part} className="whitespace-nowrap">
                    {part}
                  </span>
                ))}
              </p>
            )}
          </>
        ),
      },
      { key: 'message', header: 'Message', className: 'max-w-[200px] truncate text-muted', render: (row) => row.message },
      { key: 'created', header: 'Created Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.createdAt) },
      { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            {canManage && row.status === 'Pending' && (
              <>
                <button type="button" className="icon-btn h-9 w-9 text-green-700 hover:bg-green-50 hover:text-green-700" title="Approve" aria-label={`Approve request from ${row.employee?.name}`} onClick={() => approve(row)}>
                  <Check size={18} aria-hidden="true" />
                </button>
                <button type="button" className="icon-btn h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-600" title="Reject" aria-label={`Reject request from ${row.employee?.name}`} onClick={() => setRejecting(row)}>
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
    ];
  }, [canManage, reload, run]);

  return (
    <div>
      <PageHeader title="Requests" description="Shift, timing, technical and other requests from employees." />
      <section className="card overflow-hidden">
        <FilterBar
          idPrefix="requests"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search by employee…"
          filters={[
            { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
            { key: 'subject', label: 'Subject', type: 'select', options: REQUEST_SUBJECTS },
            { key: 'from', label: 'From', type: 'date' },
            { key: 'to', label: 'To', type: 'date' },
          ]}
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        />
        <DataTable columns={columns} rows={data?.items} loading={loading} error={error} onRetry={reload} itemLabel="requests" caption="Employee requests" />
      </section>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing ? subjectOf(viewing) : ''} description={viewing?.employee?.name} size="md">
        {viewing && (
          <div className="space-y-3 text-sm">
            <p className="text-ink">{viewing.message}</p>
            {viewing.shiftType && <p className="text-muted">Shift change: {viewing.shiftType}</p>}
            {viewing.shift && <p className="text-muted">Shift: {viewing.shift.name}</p>}
            {timingOf(viewing) && <p className="text-muted">Timing: {timingOf(viewing)}</p>}
            {viewing.fromDate && (
              <p className="text-muted">
                {viewing.toDate && viewing.toDate !== viewing.fromDate ? 'Dates' : 'Date'}: {datesOf(viewing)}
              </p>
            )}
            {viewing.subject === 'Shift' && viewing.status === 'Pending' && viewing.fromDate && (
              <p className="rounded-xl bg-brand-50 p-3 text-brand-700">Approving this switches the employee to this shift on these dates only. Their normal shift comes back after.</p>
            )}
            {viewing.notes && <p className="rounded-xl bg-canvas p-3 text-muted">Note: {viewing.notes}</p>}
          </div>
        )}
      </Modal>

      <FormModal
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title="Reject this request?"
        description={rejecting?.employee?.name}
        size="sm"
        fields={[{ name: 'notes', label: 'Reason', type: 'textarea', required: true, hint: 'The employee sees this.' }]}
        initialValues={{}}
        submitLabel="Reject"
        onSubmit={async ({ notes }) => {
          await api.put(`/requests/${rejecting._id}/status`, { status: 'Rejected', notes });
          toast.info('Request rejected');
          setRejecting(null);
          reload();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this request?"
        message="This can’t be undone."
        confirmLabel="Delete"
        loading={busy}
        onConfirm={async () => {
          if (await run(() => api.del(`/requests/${deleting._id}`), { success: 'Request deleted' })) {
            setDeleting(null);
            reload();
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
