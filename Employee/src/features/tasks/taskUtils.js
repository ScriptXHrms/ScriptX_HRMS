import { todayISO } from '../../utils/dateUtils';

export const isOverdue = (task) => task.status !== 'Done' && Boolean(task.dueDate) && task.dueDate < todayISO();

export const taskClient = (task) => task.project?.client?.company_name ?? '—';

export const assigneeNames = (task) => (task.assignedTo ?? []).map((a) => a.name).join(', ') || 'Not assigned';

/** An employee can move a task until it reaches In Review; from there it waits on an admin. */
export const employeeCanMove = (task) => task.status === 'To Do' || task.status === 'In Progress';

/** True while the work clock is running: the last span of the work log has no end yet. */
export const isClockRunning = (task) => {
  const last = task.workLog?.at(-1);
  return Boolean(last && !last.end);
};

/** Milliseconds worked, counting a running span up to `now`. */
export const workedMs = (task, now = Date.now()) =>
  (task.workLog ?? []).reduce((total, span) => total + ((span.end ? new Date(span.end) : now) - new Date(span.start)), 0);

/** Base path of the task pages in each portal. */
export const taskPath = (role, id) => `/${role}/tasks${id ? `/${id}` : ''}`;
