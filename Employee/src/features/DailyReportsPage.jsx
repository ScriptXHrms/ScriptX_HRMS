import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import FormModal from '../components/FormModal';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { PersonCell } from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import { api, withQuery } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useAction } from '../hooks/useAction';
import { useApi, useLookups } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { formatDate, formatDuration, formatTime, todayISO } from '../utils/dateUtils';
import { employeeOption, idOf, toOptions } from '../utils/format';

const blankTask = { project: '', task: '', description: '', status: 'In Progress', startTime: '', endTime: '' };

/** Daily work log. Admins see everyone's; employees see and file their own. */
export default function DailyReportsPage() {
  const { role, can } = useAuth();
  const toast = useToast();
  const isAdmin = role === 'admin';
  const canManage = !isAdmin || can('projects', 'manage');
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ open: false, report: null });
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { busy, run } = useAction();
  const { projects = [], employees = [] } = useLookups(['projects', isAdmin && 'employees']);
  const { data, loading, error, reload } = useApi(withQuery('/daily-reports', { ...filters, q: search }));

  const fields = useMemo(
    () => [
      ...(isAdmin ? [{ name: 'employee', label: 'Employee', type: 'select', required: true, options: toOptions(employees, employeeOption), show: () => !form.report }] : []),
      { name: 'date', label: 'Date', type: 'date', required: true, max: todayISO(), show: () => !form.report },
      {
        name: 'tasks',
        label: 'Tasks',
        type: 'repeater',
        required: true,
        itemLabel: 'task',
        fields: [
          { name: 'project', label: 'Project', type: 'select', options: toOptions(projects) },
          { name: 'task', label: 'Task', required: true },
          { name: 'status', label: 'Status', type: 'select', options: ['In Progress', 'Done', 'Blocked'], defaultValue: 'In Progress' },
          { name: 'startTime', label: 'Start', type: 'time' },
          { name: 'endTime', label: 'End', type: 'time' },
          { name: 'description', label: 'Notes' },
        ],
      },
    ],
    [isAdmin, employees, projects, form.report],
  );

  const columns = useMemo(
    () => [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
      ...(isAdmin ? [{ key: 'employee', header: 'Employee Name', render: (row) => <PersonCell name={row.employee?.name ?? '—'} subtitle={row.employee?.employeeId} /> }] : []),
      { key: 'attendance', header: 'Attendance', render: (row) => <StatusBadge value={row.attendance} /> },
      { key: 'totalTasks', header: 'Total Task', align: 'center' },
      { key: 'taskMinutes', header: 'Task Hours', render: (row) => formatDuration(row.taskMinutes) },
      { key: 'payableMinutes', header: 'Payable Hours', render: (row) => formatDuration(row.payableMinutes) },
      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        render: (row) => (
          <ActionMenu
            label={`Actions for report on ${row.date}`}
            items={[
              { label: 'View', icon: Eye, onClick: () => setViewing(row) },
              ...(canManage
                ? [
                    { label: 'Edit', icon: Pencil, onClick: () => setForm({ open: true, report: row }) },
                    { label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => setDeleting(row) },
                  ]
                : []),
            ]}
          />
        ),
      },
    ],
    [isAdmin, canManage],
  );

  const filterConfig = [
    { key: 'from', label: 'From', type: 'date' },
    { key: 'to', label: 'To', type: 'date' },
    ...(isAdmin ? [{ key: 'employee', label: 'Employee', type: 'select', options: toOptions(employees, employeeOption), allLabel: 'Everyone' }] : []),
  ];

  const initialValues = form.report
    ? { tasks: form.report.tasks.map((t) => ({ ...t, project: idOf(t.project) })) }
    : { date: todayISO(), tasks: [blankTask] };

  const save = async (values) => {
    if (form.report) await api.put(`/daily-reports/${form.report._id}`, { tasks: values.tasks });
    else await api.post('/daily-reports', values);
    toast.success(form.report ? 'Report updated' : 'Report submitted');
    setForm((prev) => ({ ...prev, open: false }));
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Daily Reports"
        description={isAdmin ? 'What the team worked on each day, with task and payable hours.' : 'Log what you worked on each day.'}
        actions={
          canManage && (
            <button type="button" className="btn btn-primary" onClick={() => setForm({ open: true, report: null })}>
              <Plus size={18} aria-hidden="true" />
              Add Report
            </button>
          )
        }
      />
      <section className="card overflow-hidden">
        <FilterBar
          idPrefix="reports"
          search={search}
          onSearch={isAdmin ? setSearch : undefined}
          searchPlaceholder="Search by employee…"
          filters={filterConfig}
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        />
        <DataTable columns={columns} rows={data?.items} loading={loading} error={error} onRetry={reload} itemLabel="reports" caption="Daily reports" />
      </section>

      <FormModal
        open={form.open}
        onClose={() => setForm((prev) => ({ ...prev, open: false }))}
        title={form.report ? `Edit report for ${formatDate(form.report.date)}` : 'Add daily report'}
        fields={fields}
        initialValues={initialValues}
        onSubmit={save}
        submitLabel={form.report ? 'Save changes' : 'Submit report'}
        size="xl"
      />

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing ? `Report for ${formatDate(viewing.date)}` : ''} description={viewing?.employee?.name} size="lg">
        <ul className="space-y-3">
          {viewing?.tasks.map((task) => (
            <li key={task._id} className="rounded-xl border border-line p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{task.task}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {task.project?.name ?? 'No project'} · {formatTime(task.startTime)} – {formatTime(task.endTime)}
                  </p>
                </div>
                <StatusBadge value={task.status} />
              </div>
              {task.description && <p className="mt-2 text-sm text-muted">{task.description}</p>}
            </li>
          ))}
        </ul>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this report?"
        message="This can’t be undone."
        confirmLabel="Delete"
        loading={busy}
        onConfirm={async () => {
          if (await run(() => api.del(`/daily-reports/${deleting._id}`), { success: 'Report deleted' })) {
            setDeleting(null);
            reload();
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
