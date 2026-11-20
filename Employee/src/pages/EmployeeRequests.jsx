import { useMemo, useState } from 'react';
import { Plus, Undo2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api/client';
import { REQUEST_SUBJECTS } from '../data/constants';
import { useAction } from '../hooks/useAction';
import { useApi, useLookups } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { formatDate, todayISO } from '../utils/dateUtils';
import { toOptions } from '../utils/format';

const isShift = (v) => v.subject === 'Shift';
const isTiming = (v) => v.subject === 'Timing';
const isRange = (v) => (isShift(v) && v.shiftType === 'Multiple') || isTiming(v);

// Pieces that each stay on one line, so a tight Subject column wraps between them.
const shiftLine = (row) => [formatDate(row.fromDate), row.toDate && row.toDate !== row.fromDate && `– ${formatDate(row.toDate)}`, row.shift && `· ${row.shift.name}`].filter(Boolean);

export default function EmployeeRequests() {
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(null);
  const { busy, run } = useAction();
  const { shifts = [] } = useLookups('shifts');
  const { data, loading, error, reload } = useApi('/requests/me');

  const fields = useMemo(
    () => [
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'subject', label: 'Subject', type: 'select', required: true, options: REQUEST_SUBJECTS, placeholder: 'Select subject' },
      { name: 'customSubject', label: 'Your subject', required: true, show: (v) => v.subject === 'Other', span: 2 },
      { name: 'shiftType', label: 'Shift change', type: 'select', required: true, options: ['Single', 'Multiple'], show: isShift },
      { name: 'shift', label: 'Requested shift', type: 'select', required: true, options: toOptions(shifts), show: isShift },
      {
        name: 'fromDate',
        label: 'From date',
        type: 'date',
        required: true,
        show: (v) => (isShift(v) && Boolean(v.shiftType)) || isTiming(v),
        validate: (value, values) => (isShift(values) && value < todayISO() ? 'Pick today or a later date.' : null),
      },
      {
        name: 'toDate',
        label: 'To date',
        type: 'date',
        required: true,
        show: isRange,
        validate: (value, values) => (value < values.fromDate ? 'To date can’t be before the from date.' : null),
      },
      { name: 'startTime', label: 'Start time', type: 'time', show: isTiming },
      { name: 'endTime', label: 'End time', type: 'time', show: isTiming },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
    ],
    [shifts],
  );

  const columns = useMemo(
    () => [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      { key: 'date', header: 'Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.date) },
      {
        key: 'subject',
        header: 'Subject',
        render: (row) => (
          <>
            <p>{row.subject === 'Other' ? row.customSubject : row.subject}</p>
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
      { key: 'message', header: 'Message', className: 'max-w-[280px] truncate text-muted', render: (row) => row.message },
      { key: 'notes', header: 'Notes', className: 'max-w-[200px] truncate text-muted', render: (row) => row.notes || '—' },
      { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        render: (row) =>
          row.status === 'Pending' ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setWithdrawing(row)}>
              <Undo2 size={14} aria-hidden="true" />
              Withdraw
            </button>
          ) : null,
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Requests"
        description="Ask HR for shift changes, timing changes, equipment and more."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}>
            <Plus size={18} aria-hidden="true" />
            New Request
          </button>
        }
      />
      <section className="card overflow-hidden">
        <DataTable columns={columns} rows={data?.items} loading={loading} error={error} onRetry={reload} itemLabel="requests" caption="My requests" empty={{ title: 'No requests yet', description: 'Send your first request to HR.' }} />
      </section>
      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New request"
        fields={fields}
        initialValues={{ date: todayISO() }}
        submitLabel="Send request"
        onSubmit={async (values) => {
          await api.post('/requests/me', values);
          toast.success('Request sent', 'HR has been notified.');
          setFormOpen(false);
          reload();
        }}
      />
      <ConfirmDialog
        open={Boolean(withdrawing)}
        tone="primary"
        title="Withdraw this request?"
        message="It will be removed."
        confirmLabel="Withdraw"
        cancelLabel="Keep it"
        loading={busy}
        onConfirm={async () => {
          if (await run(() => api.post(`/requests/me/${withdrawing._id}/cancel`), { success: 'Request withdrawn' })) {
            setWithdrawing(null);
            reload();
          }
        }}
        onCancel={() => setWithdrawing(null)}
      />
    </div>
  );
}
