import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Check, Hourglass, Plus, RotateCcw } from 'lucide-react';
import TaskFormModal from './TaskFormModal';
import { employeeCanMove, isOverdue, taskClient, taskPath } from './taskUtils';
import Avatar from '../../components/Avatar';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { api, withQuery } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EMPLOYEE_TASK_STATUSES, TASK_PRIORITIES, TASK_STATUSES } from '../../data/constants';
import { useApi, useLookups } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { useRiseIn } from '../../lib/animate';
import { formatShortDate } from '../../utils/dateUtils';
import { employeeOption, toOptions } from '../../utils/format';
import { cx } from '../../utils/cx';

function TaskCard({ task, index, canMove, statuses, canDecide, onOpen, onMove }) {
  const ref = useRiseIn(index);
  const overdue = isOverdue(task);
  const inReview = task.status === 'In Review';
  return (
    <li
      ref={ref}
      draggable={canMove}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', task._id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      className={cx('rounded-xl border border-line bg-white p-3 shadow-sm transition-shadow hover:shadow-card', canMove && 'cursor-grab active:cursor-grabbing')}
    >
      <button type="button" onClick={() => onOpen(task)} className="block w-full text-left">
        <span className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-muted">{task.taskId}</span>
          <StatusBadge kind="priority" value={task.priority} />
        </span>
        <span className="mt-2 block text-sm leading-snug font-semibold text-ink">{task.title}</span>
        <span className="mt-1 block truncate text-xs text-muted">{taskClient(task)}</span>
      </button>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex -space-x-1.5">
          {(task.assignedTo ?? []).slice(0, 3).map((person) => (
            <span key={person._id} title={person.name}>
              <Avatar name={person.name} photo={person.photo} size="xs" className="ring-2 ring-white" />
            </span>
          ))}
        </span>
        {task.dueDate && (
          <span className={cx('inline-flex items-center gap-1 text-xs font-medium', overdue ? 'text-red-600' : 'text-muted')}>
            <CalendarDays size={12} aria-hidden="true" />
            {formatShortDate(task.dueDate)}
          </span>
        )}
      </div>
      {canMove && (
        <label className="mt-2 block lg:hidden">
          <span className="sr-only">Move {task.title}</span>
          <select value={task.status} onChange={(e) => onMove(task, e.target.value)} className="input select py-1.5 text-xs">
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      )}
      {inReview && canDecide && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
          <button type="button" className="btn btn-sm bg-green-600 text-white shadow-sm hover:bg-green-700" onClick={() => onMove(task, 'Done')}>
            <Check size={14} aria-hidden="true" />
            Done
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onMove(task, 'To Do')}>
            <RotateCcw size={14} aria-hidden="true" />
            To Do
          </button>
        </div>
      )}
      {inReview && !canMove && !canDecide && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700">
          <Hourglass size={12} aria-hidden="true" />
          Waiting for admin review
        </p>
      )}
    </li>
  );
}

function Column({ status, tasks, canDrop, onDrop, children }) {
  const [over, setOver] = useState(false);
  return (
    <section
      aria-label={status}
      onDragOver={(event) => {
        if (!canDrop) return;
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        if (canDrop) onDrop(event.dataTransfer.getData('text/plain'), status);
      }}
      className={cx('flex w-[280px] shrink-0 flex-col rounded-2xl border bg-canvas/60 transition-colors lg:w-auto lg:min-w-0 lg:flex-1', over ? 'border-brand-400 bg-brand-50/60' : 'border-line')}
    >
      <header className="flex items-center justify-between gap-2 px-3.5 py-3">
        <StatusBadge value={status} />
        <span className="text-xs font-bold text-muted tabular-nums">{tasks.length}</span>
      </header>
      <ul className="scroll-thin flex-1 space-y-2.5 overflow-y-auto px-2.5 pb-3 lg:max-h-[calc(100dvh-340px)]">
        {children}
        {tasks.length === 0 && <li className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-xs text-muted">No tasks here</li>}
      </ul>
    </section>
  );
}

/**
 * Kanban board. Cards drag between columns; below lg each card has a status select.
 * Employees move their tasks as far as In Review; an admin then marks them Done or sends them back.
 */
export default function TaskBoard() {
  const { role, can } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const isAdmin = role === 'admin';
  const canManage = !isAdmin || can('projects', 'manage');
  const canCreate = isAdmin && canManage;
  const statuses = isAdmin ? TASK_STATUSES : EMPLOYEE_TASK_STATUSES;
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const { data, loading, reload, setData } = useApi(withQuery('/tasks', { ...filters, q: query }));
  const { projects = [], employees = [] } = useLookups(['projects', isAdmin && 'employees']);

  useEffect(() => {
    const id = setTimeout(() => setQuery(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  const grouped = useMemo(() => {
    const groups = Object.fromEntries(TASK_STATUSES.map((status) => [status, []]));
    (data?.items ?? []).forEach((task) => groups[task.status]?.push(task));
    return groups;
  }, [data]);

  const cardCanMove = (task) => canManage && (isAdmin || employeeCanMove(task));

  const move = async (taskOrId, status) => {
    const id = taskOrId._id ?? taskOrId;
    const task = (data?.items ?? []).find((t) => t._id === id);
    if (!task || task.status === status) return;
    const decision = isAdmin && canManage && task.status === 'In Review';
    if (!decision && (!cardCanMove(task) || !statuses.includes(status))) return;
    setData((prev) => ({ ...prev, items: prev.items.map((t) => (t._id === id ? { ...t, status } : t)) }));
    try {
      await api.put(`/tasks/${id}/status`, { status });
    } catch (error) {
      toast.error('Couldn’t move the task', error.message);
      reload();
    }
  };

  const filterConfig = [
    { key: 'project', label: 'Project', type: 'select', options: toOptions(projects), allLabel: 'All projects' },
    { key: 'priority', label: 'Priority', type: 'select', options: TASK_PRIORITIES, allLabel: 'All priorities' },
    ...(isAdmin ? [{ key: 'assignee', label: 'Assignee', type: 'select', options: toOptions(employees, employeeOption), allLabel: 'Everyone' }] : []),
  ];

  return (
    <div>
      <PageHeader
        title="Task Board"
        description={
          isAdmin
            ? 'Drag tasks between columns to update their status. Tasks in review wait for you to mark them Done or send them back.'
            : 'Your tasks. Drag a card up to In Review, then an admin marks it Done or sends it back.'
        }
        actions={
          canCreate && (
            <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}>
              <Plus size={18} aria-hidden="true" />
              Add Task
            </button>
          )
        }
      />

      <div className="card mb-5 overflow-hidden">
        <FilterBar
          idPrefix="board"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search tasks…"
          filters={filterConfig}
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        />
      </div>

      {loading && !data ? (
        <div className="grid gap-3 lg:grid-cols-4">
          {TASK_STATUSES.map((status) => (
            <div key={status} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="scroll-thin flex gap-3 overflow-x-auto pb-2">
          {TASK_STATUSES.map((status) => (
            <Column key={status} status={status} tasks={grouped[status]} canDrop={canManage && statuses.includes(status)} onDrop={move}>
              {grouped[status].map((task, index) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  index={index}
                  canMove={cardCanMove(task)}
                  statuses={statuses}
                  canDecide={isAdmin && canManage}
                  onOpen={(item) => navigate(taskPath(role, item._id))}
                  onMove={move}
                />
              ))}
            </Column>
          ))}
        </div>
      )}

      {canCreate && <TaskFormModal open={formOpen} onClose={() => setFormOpen(false)} canAssign onSaved={reload} />}
    </div>
  );
}
