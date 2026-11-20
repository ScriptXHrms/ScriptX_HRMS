import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import TaskFormModal from './TaskFormModal';
import { assigneeNames, isOverdue, taskClient } from './taskUtils';
import ActionMenu from '../../components/ActionMenu';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { api, withQuery } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../data/constants';
import { useAction } from '../../hooks/useAction';
import { useApi, useLookups } from '../../hooks/useApi';
import { useQueryParams } from '../../hooks/useQueryParams';
import { formatShortDate } from '../../utils/dateUtils';
import { employeeOption, toOptions } from '../../utils/format';
import { cx } from '../../utils/cx';

/** Task table for admins. `byClient` adds the client filter used by Client Tasks. */
export default function TaskListView({ title, description, byClient = false }) {
  const { can } = useAuth();
  const navigate = useNavigate();
  const canManage = can('projects', 'manage');
  const [params, updateParams] = useQueryParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [query, setQuery] = useState(search);
  const [form, setForm] = useState({ open: false, task: null });
  const [deleting, setDeleting] = useState(null);
  const { busy, run } = useAction();
  const { projects = [], employees = [], clients = [] } = useLookups(['projects', 'employees', byClient && 'clients']);

  const filters = {
    status: params.get('status') ?? '',
    priority: params.get('priority') ?? '',
    project: params.get('project') ?? '',
    assignee: params.get('assignee') ?? '',
    client: params.get('client') ?? '',
  };

  useEffect(() => {
    const id = setTimeout(() => setQuery(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  const overdueOnly = filters.status === 'Overdue';
  const { data, loading, error, reload } = useApi(withQuery('/tasks', { ...filters, status: overdueOnly ? '' : filters.status, overdue: overdueOnly ? 'true' : '', q: query }));

  const columns = useMemo(
    () => [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      { key: 'taskId', header: 'Task ID', render: (task) => <span className="text-xs font-semibold text-muted">{task.taskId}</span> },
      {
        key: 'title',
        header: 'Title',
        className: 'max-w-[280px]',
        render: (task) => (
          <Link to={`/admin/tasks/${task._id}`} className="block truncate font-semibold text-ink hover:text-brand-700">
            {task.title}
          </Link>
        ),
      },
      { key: 'project', header: 'Project', className: 'max-w-[200px] truncate text-muted', render: (task) => task.project?.name ?? '—' },
      ...(byClient ? [{ key: 'client', header: 'Client', render: taskClient }] : []),
      { key: 'assigned', header: 'Assigned To', className: 'max-w-[170px] truncate', render: assigneeNames },
      { key: 'priority', header: 'Priority', render: (task) => <StatusBadge kind="priority" value={task.priority} /> },
      { key: 'dueDate', header: 'Due', render: (task) => <span className={cx(isOverdue(task) && 'font-semibold text-red-600')}>{formatShortDate(task.dueDate)}</span> },
      { key: 'status', header: 'Status', render: (task) => <StatusBadge value={task.status} /> },
      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        render: (task) => (
          <ActionMenu
            label={`Actions for ${task.title}`}
            items={[
              { label: 'View', icon: Eye, onClick: () => navigate(`/admin/tasks/${task._id}`) },
              ...(canManage
                ? [
                    { label: 'Edit', icon: Pencil, onClick: () => setForm({ open: true, task }) },
                    { label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => setDeleting(task) },
                  ]
                : []),
            ]}
          />
        ),
      },
    ],
    [byClient, canManage, navigate],
  );

  const filterConfig = [
    ...(byClient ? [{ key: 'client', label: 'Client', type: 'select', options: toOptions(clients, 'company_name'), allLabel: 'All clients' }] : []),
    { key: 'status', label: 'Status', type: 'select', options: [...TASK_STATUSES, 'Overdue'], allLabel: 'All statuses' },
    { key: 'priority', label: 'Priority', type: 'select', options: TASK_PRIORITIES, allLabel: 'All priorities' },
    { key: 'project', label: 'Project', type: 'select', options: toOptions(projects), allLabel: 'All projects' },
    { key: 'assignee', label: 'Assigned to', type: 'select', options: toOptions(employees, employeeOption), allLabel: 'Everyone' },
  ];

  const confirmDelete = async () => {
    if (await run(() => api.del(`/tasks/${deleting._id}`), { success: 'Task deleted' })) {
      setDeleting(null);
      reload();
    }
  };

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          canManage && (
            <button type="button" className="btn btn-primary" onClick={() => setForm({ open: true, task: null })}>
              <Plus size={18} aria-hidden="true" />
              Add Task
            </button>
          )
        }
      />
      <section className="card overflow-hidden">
        <FilterBar idPrefix="tasks" search={search} onSearch={setSearch} searchPlaceholder="Search by title or ID…" filters={filterConfig} values={filters} onChange={(key, value) => updateParams({ [key]: value })} />
        <DataTable columns={columns} rows={data?.items} loading={loading} error={error} onRetry={reload} itemLabel="tasks" caption={title} />
      </section>
      <TaskFormModal open={form.open} task={form.task} onClose={() => setForm((prev) => ({ ...prev, open: false }))} canAssign onSaved={reload} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this task?"
        message={`“${deleting?.title}” and its sub tasks and comments will be deleted. This can’t be undone.`}
        confirmLabel="Delete"
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
