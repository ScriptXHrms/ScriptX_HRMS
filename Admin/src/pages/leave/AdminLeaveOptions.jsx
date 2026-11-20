import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import ActionMenu from '../../components/ActionMenu';
import { PersonCell } from '../../components/Avatar';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import FormModal from '../../components/FormModal';
import PageHeader from '../../components/PageHeader';
import { api, withQuery } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { LEAVE_DURATIONS } from '../../data/constants';
import { useAction } from '../../hooks/useAction';
import { useApi, useLookups } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { formatDate, todayISO } from '../../utils/dateUtils';
import { employeeOption, toOptions } from '../../utils/format';

/** Leave entered by HR on an employee's behalf. It is approved straight away. */
export default function AdminLeaveOptions() {
  const { can } = useAuth();
  const toast = useToast();
  const canManage = can('leave', 'manage');
  const [filters, setFilters] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const { busy, run } = useAction();
  const { employees = [], leaveTypes = [] } = useLookups(['employees', 'leaveTypes']);
  const { data, loading, error, reload } = useApi(withQuery('/leaves', { category: 'Leave', createdBy: 'admin', ...filters }));

  const fields = useMemo(
    () => [
      { name: 'employee', label: 'Employee', type: 'select', required: true, options: toOptions(employees, employeeOption), span: 2 },
      { name: 'leaveType', label: 'Leave type', type: 'select', required: true, options: leaveTypes.map((t) => t.name) },
      { name: 'duration', label: 'Duration', type: 'select', required: true, options: LEAVE_DURATIONS },
      { name: 'startDate', label: 'Start date', type: 'date', required: true },
      { name: 'endDate', label: 'End date', type: 'date', required: true, show: (v) => v.duration === 'Full Day', validate: (value, values) => (value < values.startDate ? 'End date can’t be before the start date.' : null) },
      { name: 'reason', label: 'Reason', type: 'textarea', required: true },
      { name: 'note', label: 'Note', type: 'textarea' },
    ],
    [employees, leaveTypes],
  );

  const columns = useMemo(
    () => [
      { key: 'sno', header: 'Sno', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      { key: 'employee', header: 'Employee Name', render: (row) => <PersonCell name={row.employee?.name ?? '—'} subtitle={row.employee?.employeeId} /> },
      { key: 'leaveType', header: 'Leave Type' },
      { key: 'startDate', header: 'Start Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.startDate) },
      { key: 'endDate', header: 'End Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.endDate) },
      { key: 'duration', header: 'Duration', render: (row) => (row.duration === 'Full Day' ? `${row.days} day${row.days === 1 ? '' : 's'}` : row.duration) },
      { key: 'createdAt', header: 'Created Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.createdAt) },
      { key: 'note', header: 'Note', className: 'max-w-[200px] truncate text-muted', render: (row) => row.note || row.reason },
      ...(canManage
        ? [
            {
              key: 'actions',
              header: <span className="sr-only">Actions</span>,
              align: 'right',
              render: (row) => <ActionMenu label="Actions for this leave" items={[{ label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => setDeleting(row) }]} />,
            },
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <div>
      <PageHeader
        title="Leave Option"
        description="Add leave for an employee. It’s approved immediately."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin/leaves" className="btn btn-secondary">
              Leaves
            </Link>
            <Link to="/admin/leave-types" className="btn btn-secondary">
              Leave Type
            </Link>
            {canManage && (
              <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}>
                <Plus size={18} aria-hidden="true" />
                Add Leave
              </button>
            )}
          </div>
        }
      />
      <section className="card overflow-hidden">
        <FilterBar
          idPrefix="leave-options"
          filters={[
            { key: 'employee', label: 'Employee', type: 'select', options: toOptions(employees, employeeOption), allLabel: 'Everyone' },
            { key: 'from', label: 'From', type: 'date' },
            { key: 'to', label: 'To', type: 'date' },
          ]}
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        />
        <DataTable columns={columns} rows={data?.items} loading={loading} error={error} onRetry={reload} itemLabel="leaves" caption="Leave added by HR" empty={{ title: 'No leave added yet', description: 'Leave you add for employees appears here.' }} />
      </section>
      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add leave"
        fields={fields}
        initialValues={{ duration: 'Full Day', startDate: todayISO(), endDate: todayISO() }}
        submitLabel="Add leave"
        onSubmit={async (values) => {
          await api.post('/leaves/admin', values);
          toast.success('Leave added');
          setFormOpen(false);
          reload();
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this leave?"
        message="This can’t be undone."
        confirmLabel="Delete"
        loading={busy}
        onConfirm={async () => {
          if (await run(() => api.del(`/leaves/${deleting._id}`), { success: 'Leave deleted' })) {
            setDeleting(null);
            reload();
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
