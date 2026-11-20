import { useMemo, useState } from 'react';
import { Ban, Plus } from 'lucide-react';
import LeaveApplyModal from './LeaveApplyModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { api, fileUrl, withQuery } from '../../api/client';
import { useAction } from '../../hooks/useAction';
import { useApi } from '../../hooks/useApi';
import { formatDate, formatTime } from '../../utils/dateUtils';

/** An employee's own leave or WFH history, with the apply form. */
export default function MyRequestsPage({ category, title, description, applyLabel }) {
  const isWfh = category === 'WFH';
  const [formOpen, setFormOpen] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [filters, setFilters] = useState({});
  const { busy, run } = useAction();
  const { data, loading, error, reload } = useApi(withQuery('/leaves/me', { category: isWfh ? 'WFH' : filters.category }));

  const rows = useMemo(() => {
    const items = data?.items;
    if (!items) return undefined;
    const scoped = isWfh ? items : items.filter((row) => row.category !== 'WFH');
    return filters.status ? scoped.filter((row) => row.status === filters.status) : scoped;
  }, [data, filters.status, isWfh]);

  const columns = useMemo(
    () => [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      { key: 'type', header: isWfh ? 'Work Type' : 'Leave Type', render: (row) => row.leaveType ?? 'Leave' },
      { key: 'from', header: 'From Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.startDate) },
      { key: 'to', header: 'To Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.endDate) },
      ...(isWfh
        ? []
        : [
            {
              key: 'duration',
              header: 'Duration',
              className: 'whitespace-nowrap',
              render: (row) => (row.category === 'Permission' ? `${formatTime(row.startTime)} – ${formatTime(row.endTime)}` : row.duration === 'Full Day' ? `${row.days} day${row.days === 1 ? '' : 's'}` : row.duration),
            },
            {
              key: 'attachment',
              header: 'Attachment',
              render: (row) =>
                row.attachment ? (
                  <a href={fileUrl(row.attachment.url)} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-700 hover:underline">
                    View
                  </a>
                ) : (
                  '—'
                ),
            },
          ]),
      { key: 'reason', header: 'Reason', className: 'max-w-[240px] truncate text-muted', render: (row) => row.reason },
      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <span title={row.note}>
            <StatusBadge value={row.status} />
          </span>
        ),
      },
      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        render: (row) =>
          row.status === 'Pending' ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCancelling(row)}>
              <Ban size={14} aria-hidden="true" />
              Cancel
            </button>
          ) : null,
      },
    ],
    [isWfh],
  );

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}>
            <Plus size={18} aria-hidden="true" />
            {applyLabel}
          </button>
        }
      />
      <section className="card overflow-hidden">
        <FilterBar
          idPrefix="my-requests"
          filters={[
            ...(isWfh ? [] : [{ key: 'category', label: 'Type', type: 'select', options: ['Leave', 'Permission'], allLabel: 'Leave & permission' }]),
            { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected', 'Cancelled'] },
          ]}
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        />
        <DataTable columns={columns} rows={rows} loading={loading} error={error} onRetry={reload} itemLabel="requests" caption={title} empty={{ title: 'No requests yet', description: 'Your requests and their status appear here.' }} />
      </section>
      <LeaveApplyModal open={formOpen} onClose={() => setFormOpen(false)} category={isWfh ? 'WFH' : undefined} onApplied={reload} />
      <ConfirmDialog
        open={Boolean(cancelling)}
        tone="primary"
        title="Cancel this request?"
        message="HR won’t need to act on it any more."
        confirmLabel="Cancel request"
        cancelLabel="Keep it"
        loading={busy}
        onConfirm={async () => {
          if (await run(() => api.post(`/leaves/me/${cancelling._id}/cancel`), { success: 'Request cancelled' })) {
            setCancelling(null);
            reload();
          }
        }}
        onCancel={() => setCancelling(null)}
      />
    </div>
  );
}
