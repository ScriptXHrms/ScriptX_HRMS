import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, ChevronLeft, ChevronRight, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { CATEGORY_STYLES, shiftMonth, timeLabel, toEvent, weekDays } from './calendarUtils';
import MiniMonth from './MiniMonth';
import MonthGrid from './MonthGrid';
import TimeGrid from './TimeGrid';
import TaskFormModal from '../tasks/TaskFormModal';
import { assigneeNames, taskClient } from '../tasks/taskUtils';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import Tabs from '../../components/Tabs';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useAction } from '../../hooks/useAction';
import { useApi } from '../../hooks/useApi';
import { useFadeIn } from '../../lib/animate';
import { formatDayDate, formatLongDate, formatShortDate, shiftISODate, todayISO } from '../../utils/dateUtils';
import { monthLabel } from '../../utils/format';
import { cx } from '../../utils/cx';

const VIEWS = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];
const PHONE_WIDTH = 768;

function Fact({ label, children }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold break-words text-ink">{children || '—'}</dd>
    </div>
  );
}

/**
 * Tasks on a calendar, for both portals. Everything comes from the tasks API:
 * admins with full project access can create, edit and delete; employees see
 * their own tasks and can't change anything here.
 */
export default function ContentCalendar() {
  const { role, can } = useAuth();
  const canManage = role === 'admin' && can('projects', 'manage');
  const today = todayISO();
  const [anchor, setAnchor] = useState(today);
  const [view, setView] = useState(() => (window.innerWidth < PHONE_WIDTH ? 'day' : 'week'));
  const [form, setForm] = useState({ open: false, task: null });
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { busy, run } = useAction();
  const { data, loading, error, reload } = useApi('/tasks');

  const tasks = useMemo(() => data?.items ?? [], [data]);
  const events = useMemo(() => tasks.map(toEvent).filter(Boolean), [tasks]);
  const days = useMemo(() => (view === 'day' ? [anchor] : weekDays(anchor)), [view, anchor]);
  const gridRef = useFadeIn(`${view}-${view === 'month' ? anchor.slice(0, 7) : days[0]}`);

  const step = (direction) => {
    if (view === 'month') setAnchor((value) => shiftMonth(value, direction));
    else setAnchor((value) => shiftISODate(value, direction * (view === 'week' ? 7 : 1)));
  };

  const rangeLabel = view === 'day' ? formatLongDate(anchor) : view === 'week' ? `${formatShortDate(days[0])} – ${formatShortDate(days[6])}` : monthLabel(anchor.slice(0, 7));
  const undated = tasks.length - events.length;

  const openDay = (day) => {
    setAnchor(day);
    setView('day');
  };

  const confirmDelete = async () => {
    if (await run(() => api.del(`/tasks/${deleting._id}`), { success: 'Task deleted' })) {
      setDeleting(null);
      reload();
    }
  };

  return (
    <div className="space-y-5">
      <section className="card flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-ink">Content Calendar</h1>
          <p className="mt-0.5 text-sm text-muted">{canManage ? 'Every task on one calendar. Select a task to edit or delete it.' : role === 'admin' ? 'Every task on one calendar.' : 'Your tasks, laid out by day.'}</p>
        </div>
        {canManage && (
          <button type="button" className="btn btn-primary shrink-0" onClick={() => setForm({ open: true, task: null })}>
            <Plus size={18} aria-hidden="true" />
            Create
          </button>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-5 max-xl:order-2" aria-label="Calendar tools">
          <MiniMonth selected={anchor} onSelect={setAnchor} />
        </aside>

        <section className="card min-w-0 self-start overflow-hidden" aria-label="Calendar">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <Tabs label="Calendar view" active={view} onChange={setView} tabs={VIEWS} />
            <div className="flex items-center justify-between gap-1 sm:justify-end">
              <button type="button" className="btn btn-secondary btn-sm mr-1" onClick={() => setAnchor(today)}>
                Today
              </button>
              <button type="button" className="icon-btn h-9 w-9" aria-label="Previous" onClick={() => step(-1)}>
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <p className="min-w-0 px-1 text-center text-sm font-bold text-ink sm:min-w-[150px]" aria-live="polite">
                {rangeLabel}
              </p>
              <button type="button" className="icon-btn h-9 w-9" aria-label="Next" onClick={() => step(1)}>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {error && !data ? (
            <EmptyState title="Couldn’t load the calendar" description={error.message} action={<button type="button" className="btn btn-secondary" onClick={reload}>Try again</button>} />
          ) : loading && !data ? (
            <div className="border-t border-line p-5">
              <div className="skeleton h-96 w-full" />
            </div>
          ) : (
            <div ref={gridRef}>
              {view === 'month' ? <MonthGrid anchor={anchor} events={events} onOpen={setViewing} onPickDay={openDay} /> : <TimeGrid days={days} events={events} onOpen={setViewing} />}
            </div>
          )}

          {undated > 0 && (
            <p className="border-t border-line px-5 py-2.5 text-xs text-muted">
              {undated} task{undated === 1 ? ' has' : 's have'} no dates, so {undated === 1 ? 'it isn’t' : 'they aren’t'} on the calendar.
            </p>
          )}
        </section>
      </div>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.task.title ?? 'Task'}
        description={viewing?.task.taskId}
        footer={
          canManage ? (
            <>
              <Link to={`/admin/tasks/${viewing?.id}`} className="btn btn-secondary">
                <ExternalLink size={16} aria-hidden="true" />
                Open task
              </Link>
              <button
                type="button"
                className="btn btn-secondary text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  setDeleting(viewing.task);
                  setViewing(null);
                }}
              >
                <Trash2 size={16} aria-hidden="true" />
                Delete
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setForm({ open: true, task: viewing.task });
                  setViewing(null);
                }}
              >
                <Pencil size={16} aria-hidden="true" />
                Edit
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={() => setViewing(null)}>
              Close
            </button>
          )
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={viewing.task.status} />
              <StatusBadge kind="priority" value={viewing.task.priority} />
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
                <span className={cx('h-2 w-2 rounded-full', CATEGORY_STYLES[viewing.category].dot)} aria-hidden="true" />
                {viewing.category}
              </span>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Fact label="Date">{viewing.start === viewing.end ? formatDayDate(viewing.start) : `${formatDayDate(viewing.start)} – ${formatDayDate(viewing.end)}`}</Fact>
              <Fact label="Time">{timeLabel(viewing) || 'All day'}</Fact>
              <Fact label="Project">{viewing.task.project?.name}</Fact>
              <Fact label="Client">{taskClient(viewing.task)}</Fact>
              <div className="sm:col-span-2">
                <Fact label="Assigned to">{assigneeNames(viewing.task)}</Fact>
              </div>
            </dl>
            {viewing.task.description && <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">{viewing.task.description}</p>}
          </div>
        )}
      </Modal>

      {canManage && (
        <>
          <TaskFormModal
            open={form.open}
            task={form.task}
            defaults={{ startDate: anchor, dueDate: anchor }}
            onClose={() => setForm((prev) => ({ ...prev, open: false }))}
            canAssign
            onSaved={reload}
          />
          <ConfirmDialog
            open={Boolean(deleting)}
            title="Delete this task?"
            message={`“${deleting?.title}” and its sub tasks and comments will be deleted. This can’t be undone.`}
            confirmLabel="Delete"
            loading={busy}
            onConfirm={confirmDelete}
            onCancel={() => setDeleting(null)}
          />
        </>
      )}

      {tasks.length === 0 && data && (
        <div className="card">
          <EmptyState icon={CalendarCheck} title="No tasks yet" description={canManage ? 'Create a task and it appears on the calendar.' : 'Tasks assigned to you appear here.'} className="py-8" />
        </div>
      )}
    </div>
  );
}
