import mongoose from 'mongoose';
import { nextSequence, Project, SubTask, Task, TASK_STATUSES, TaskComment, TaskLog } from '../models/index.js';
import { forbiddenUnless } from '../middleware/access.js';
import { fileRecord } from '../middleware/upload.js';
import { dayKey, timeToMinutes } from '../utils/dates.js';
import { badRequest, conflict, escapeRegex, forbidden, notFound } from '../utils/http.js';
import { notifyAdmins, notifyEmployees } from '../utils/notify.js';

const POPULATE = [
  { path: 'project', select: 'name client', populate: { path: 'client', select: 'client_name company_name' } },
  { path: 'assignedTo', select: 'name employeeId photo' },
];

const actorOf = (req) => ({
  kind: req.auth.isSuperAdmin ? 'admin' : 'employee',
  id: req.auth.account._id,
  name: req.auth.account.name,
});

const isEmployeeSession = (req) => req.auth.portal === 'employee';

function log(req, task, action, detail) {
  return TaskLog.create({ task: task._id, action, detail, actor: actorOf(req) });
}

/** Admin portal users need the projects module. Employees only see tasks assigned to them. */
function assertTaskAccess(req, task, level = 'view') {
  if (isEmployeeSession(req)) {
    if (!task.assignedTo.some((a) => String(a._id ?? a) === String(req.auth.employeeId))) throw forbidden('This task isn’t assigned to you.');
    return;
  }
  forbiddenUnless(req, 'projects', level);
}

async function loadTask(req, level) {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound('Task not found.');
  const task = await Task.findById(req.params.id);
  if (!task) throw notFound('Task not found.');
  assertTaskAccess(req, task, level);
  return task;
}

/** Employees take a task as far as In Review. From there an admin marks it Done or sends it back to To Do. */
function assertEmployeeMove(req, task, status) {
  if (!isEmployeeSession(req)) return;
  if (task.status === 'In Review') throw forbidden('This task is waiting for admin review.');
  if (task.status === 'Done') throw forbidden('This task is done. Ask an admin to reopen it.');
  if (status === 'Done') throw forbidden('Only an admin can mark a task done. Move it to In Review.');
}

/**
 * The work clock starts when a task goes In Progress and keeps running through In Review. It stops when the
 * task goes back to To Do or is Done. A pause stops it too, but only belongs to In Progress.
 */
function trackWork(task, nextStatus) {
  const open = task.workLog.at(-1);
  const running = open && !open.end;
  const active = nextStatus === 'In Progress' || nextStatus === 'In Review';
  if (nextStatus !== 'In Progress') {
    task.paused = false;
    task.pauseComment = '';
  }
  if (!active && running) open.end = new Date();
  const starts = nextStatus === 'In Progress' || task.status === 'In Progress';
  if (active && starts && !running && !task.paused) task.workLog.push({ start: new Date() });
}

function assertSchedule({ startDate, dueDate, startTime, endTime }) {
  if (startDate && dueDate && dueDate < startDate) throw badRequest('Due date can’t be before the start date.');
  const from = timeToMinutes(startTime);
  const to = timeToMinutes(endTime);
  if ((startTime && from === null) || (endTime && to === null)) throw badRequest('Enter a valid time.');
  if (endTime && !startTime) throw badRequest('Add a start time too.');
  if (from !== null && to !== null && to <= from) throw badRequest('End time must be after the start time.');
}

const workedMinutes = (task, now = new Date()) =>
  Math.round(task.workLog.reduce((total, span) => total + ((span.end ? new Date(span.end) : now) - new Date(span.start)), 0) / 60000);

const withTotals = (task) => ({ ...task, workedMinutes: workedMinutes(task) });

export const getTasks = async (req, res) => {
  const { status, priority, project, assignee, client, q, overdue } = req.query;
  const filter = {};
  if (isEmployeeSession(req)) filter.assignedTo = req.auth.employeeId;
  else {
    forbiddenUnless(req, 'projects');
    if (assignee) filter.assignedTo = String(assignee);
  }
  if (status) filter.status = String(status);
  if (priority) filter.priority = String(priority);
  if (project) filter.project = String(project);
  if (client) {
    const projects = await Project.find({ client: String(client) }).select('_id').lean();
    filter.project = { $in: projects.map((p) => p._id) };
  }
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: pattern }, { taskId: pattern }];
  }
  if (overdue === 'true') {
    filter.status = { $ne: 'Done' };
    filter.dueDate = { $lt: dayKey() };
  }
  const items = await Task.find(filter).populate(POPULATE).sort({ createdAt: -1 }).limit(1000).lean();
  res.json({ items: items.map(withTotals), total: items.length });
};

export const createTask = async (req, res) => {
  if (isEmployeeSession(req)) throw forbidden('Only admins can add tasks.');
  forbiddenUnless(req, 'projects', 'manage');
  const { title, description, project, assignedTo, category, priority, startDate, dueDate, startTime, endTime, status } = req.body;
  assertSchedule(req.body);
  const assignees = [assignedTo ?? []].flat().filter(Boolean);

  const task = await Task.create({
    taskId: `SX-T${String(await nextSequence('task')).padStart(4, '0')}`,
    title,
    description,
    project: project || undefined,
    assignedTo: assignees,
    category,
    priority,
    startDate,
    dueDate,
    startTime,
    endTime,
    status: TASK_STATUSES.includes(status) ? status : 'To Do',
    workLog: status === 'In Progress' ? [{ start: new Date() }] : [],
    createdBy: actorOf(req),
  });
  await log(req, task, 'Created', task.title);
  await notifyEmployees(
    assignees.filter((id) => String(id) !== String(req.auth.employeeId)),
    { type: 'task', title: 'New task assigned', message: `${task.taskId} · ${task.title}`, link: `/employee/tasks/${task._id}` },
  );
  res.status(201).json({ item: withTotals(await Task.findById(task._id).populate(POPULATE).lean()) });
};

export const getTaskById = async (req, res) => {
  const task = await loadTask(req);
  const [item, subtasks, comments, logs] = await Promise.all([
    Task.findById(task._id).populate(POPULATE).lean(),
    SubTask.find({ task: task._id }).populate('assignedTo', 'name employeeId').sort({ createdAt: 1 }).lean(),
    TaskComment.find({ task: task._id }).sort({ createdAt: 1 }).lean(),
    TaskLog.find({ task: task._id }).sort({ createdAt: -1 }).limit(100).lean(),
  ]);
  res.json({ item: withTotals(item), subtasks, comments, logs });
};

export const updateTask = async (req, res) => {
  const task = await loadTask(req, 'manage');
  if (isEmployeeSession(req)) throw forbidden('Only admins can edit task details.');
  const { title, description, project, assignedTo, category, priority, startDate, dueDate, startTime, endTime } = req.body;
  assertSchedule(req.body);
  const before = task.assignedTo.map(String);
  task.set({ title, description, project, category, priority, startDate, dueDate, startTime, endTime, assignedTo: [assignedTo ?? []].flat().filter(Boolean) });
  await task.save();
  await log(req, task, 'Updated', 'Task details changed');
  await notifyEmployees(
    task.assignedTo.map(String).filter((id) => !before.includes(id)),
    { type: 'task', title: 'New task assigned', message: `${task.taskId} · ${task.title}`, link: `/employee/tasks/${task._id}` },
  );
  res.json({ item: withTotals(await Task.findById(task._id).populate(POPULATE).lean()) });
};

export const updateTaskStatus = async (req, res) => {
  const task = await loadTask(req, 'manage');
  const { status } = req.body;
  if (!TASK_STATUSES.includes(status)) throw badRequest('Unknown status.');
  if (status === task.status) return res.json({ item: withTotals(task.toObject()) });
  assertEmployeeMove(req, task, status);
  const previous = task.status;
  trackWork(task, status);
  task.status = status;
  await task.save();
  await log(req, task, 'Status changed', `${previous} → ${status}`);
  if (isEmployeeSession(req) && status === 'In Review') {
    await notifyAdmins({ type: 'task', title: 'Task ready for review', message: `${task.taskId} · ${task.title}`, link: `/admin/tasks/${task._id}` });
  } else if (!isEmployeeSession(req)) {
    await notifyEmployees(task.assignedTo, { type: 'task', title: `Task moved to ${status}`, message: `${task.taskId} · ${task.title}`, link: `/employee/tasks/${task._id}` });
  }
  return res.json({ item: withTotals(await Task.findById(task._id).populate(POPULATE).lean()) });
};

export const updateTaskTester = async (req, res) => {
  const task = await loadTask(req, 'manage');
  const { testerStatus } = req.body;
  if (!['Not Tested', 'Testing', 'Passed', 'Failed'].includes(testerStatus)) throw badRequest('Unknown tester status.');
  task.testerStatus = testerStatus;
  await task.save();
  await log(req, task, 'Tester status', testerStatus);
  res.json({ item: withTotals(await Task.findById(task._id).populate(POPULATE).lean()) });
};

export const pauseTask = async (req, res) => {
  const task = await loadTask(req, 'manage');
  const paused = Boolean(req.body.paused);
  const comment = String(req.body.comment ?? '').trim();
  if (paused && task.status !== 'In Progress') throw conflict('Only tasks in progress can be paused.');
  if (paused && !comment) throw badRequest('Add a reason for pausing.');
  task.paused = paused;
  task.pauseComment = paused ? comment : '';
  const open = task.workLog.at(-1);
  if (paused && open && !open.end) open.end = new Date();
  if (!paused && task.status === 'In Progress') task.workLog.push({ start: new Date() });
  await task.save();
  await log(req, task, paused ? 'Paused' : 'Resumed', comment);
  res.json({ item: withTotals(await Task.findById(task._id).populate(POPULATE).lean()) });
};

export const deleteTask = async (req, res) => {
  forbiddenUnless(req, 'projects', 'manage');
  const task = await loadTask(req, 'manage');
  await Promise.all([SubTask.deleteMany({ task: task._id }), TaskComment.deleteMany({ task: task._id }), TaskLog.deleteMany({ task: task._id })]);
  await task.deleteOne();
  res.json({ ok: true });
};

export const getTaskComments = async (req, res) => {
  const task = await loadTask(req, 'view');
  res.json({ items: await TaskComment.find({ task: task._id }).sort({ createdAt: 1 }).lean() });
};

export const addTaskComment = async (req, res) => {
  const task = await loadTask(req, 'view');
  const message = String(req.body.message ?? '').trim();
  const files = (req.files ?? []).map((file) => fileRecord(file, 'tasks'));
  if (!message && files.length === 0) throw badRequest('Write a comment or attach a file.');
  const author = actorOf(req);
  const comment = await TaskComment.create({ task: task._id, message, files, author });

  const preview = message ? (message.length > 80 ? `${message.slice(0, 77)}…` : message) : `Sent ${files.length} file${files.length === 1 ? '' : 's'}`;
  const notification = { type: 'task', title: `New comment on ${task.taskId}`, message: `${author.name}: ${preview}` };
  if (isEmployeeSession(req)) await notifyAdmins({ ...notification, link: `/admin/tasks/${task._id}` });
  await notifyEmployees(
    task.assignedTo.filter((id) => String(id) !== String(req.auth.employeeId)),
    { ...notification, link: `/employee/tasks/${task._id}` },
  );
  res.status(201).json({ item: comment });
};

export const addTaskDocument = async (req, res) => {
  const task = await loadTask(req, 'manage');
  if (!req.file) throw badRequest('Choose a file to upload.');
  task.documents.push(fileRecord(req.file, 'tasks'));
  await task.save();
  await log(req, task, 'File added', req.file.originalname);
  res.status(201).json({ documents: task.documents });
};

export const deleteTaskDocument = async (req, res) => {
  const task = await loadTask(req, 'manage');
  const file = task.documents.id(req.params.fileId);
  if (!file) throw notFound('File not found.');
  file.deleteOne();
  await task.save();
  res.json({ documents: task.documents });
};

export const addSubTask = async (req, res) => {
  const task = await loadTask(req, 'manage');
  const { title, assignedTo, priority, dueDate } = req.body;
  const subtask = await SubTask.create({ task: task._id, title, assignedTo: assignedTo || undefined, priority, dueDate });
  await log(req, task, 'Sub task added', subtask.title);
  res.status(201).json({ item: await SubTask.findById(subtask._id).populate('assignedTo', 'name employeeId').lean() });
};

export const updateSubTask = async (req, res) => {
  const task = await loadTask(req, 'manage');
  const subtask = await SubTask.findOne({ _id: req.params.subId, task: task._id });
  if (!subtask) throw notFound('Sub task not found.');
  const { title, assignedTo, priority, dueDate, status } = req.body;
  subtask.set({ title, priority, dueDate, status, assignedTo: assignedTo || undefined });
  await subtask.save();
  res.json({ item: await SubTask.findById(subtask._id).populate('assignedTo', 'name employeeId').lean() });
};

export const deleteSubTask = async (req, res) => {
  const task = await loadTask(req, 'manage');
  const subtask = await SubTask.findOneAndDelete({ _id: req.params.subId, task: task._id });
  if (!subtask) throw notFound('Sub task not found.');
  await log(req, task, 'Sub task removed', subtask.title);
  res.json({ ok: true });
};
