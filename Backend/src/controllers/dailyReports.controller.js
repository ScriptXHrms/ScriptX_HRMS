import mongoose from 'mongoose';
import { Attendance, DailyReport, Employee } from '../models/index.js';
import { forbiddenUnless } from '../middleware/access.js';
import { summarizeEntries } from '../utils/attendance.js';
import { isDayKey, timeToMinutes } from '../utils/dates.js';
import { badRequest, conflict, escapeRegex, forbidden, notFound } from '../utils/http.js';

export const POPULATE = [
  { path: 'employee', select: 'name employeeId photo' },
  { path: 'tasks.project', select: 'name' },
];

export const isEmployeeSession = (req) => req.auth.portal === 'employee';

function cleanTasks(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) throw badRequest('Add at least one task.');
  return tasks.map((row, index) => {
    const from = timeToMinutes(row.startTime);
    const to = timeToMinutes(row.endTime);
    if (!String(row.task ?? '').trim()) throw badRequest(`Task ${index + 1}: enter what you worked on.`);
    if (from === null || to === null || to <= from) throw badRequest(`Task ${index + 1}: end time must be after start time.`);
    return { project: row.project || undefined, task: String(row.task).trim(), description: row.description, status: row.status || 'In Progress', startTime: row.startTime, endTime: row.endTime };
  });
}

const taskMinutes = (tasks) => tasks.reduce((total, t) => total + Math.max(0, (timeToMinutes(t.endTime) ?? 0) - (timeToMinutes(t.startTime) ?? 0)), 0);

async function withAttendance(reports) {
  if (reports.length === 0) return [];
  const records = await Attendance.find({
    $or: reports.map((r) => ({ employee: r.employee?._id ?? r.employee, date: r.date })),
  }).lean();
  const index = new Map(records.map((r) => [`${r.employee}|${r.date}`, r]));
  return reports.map((report) => {
    const record = index.get(`${report.employee?._id ?? report.employee}|${report.date}`);
    return {
      ...report,
      totalTasks: report.tasks.length,
      taskMinutes: taskMinutes(report.tasks),
      payableMinutes: record ? summarizeEntries(record).payableMinutes : 0,
      attendance: record ? (record.workType === 'WFH' ? 'Work From Home' : 'Present') : 'Absent',
    };
  });
}

async function loadOwned(req, level) {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound('Report not found.');
  const report = await DailyReport.findById(req.params.id);
  if (!report) throw notFound('Report not found.');
  if (isEmployeeSession(req)) {
    if (String(report.employee) !== String(req.auth.employeeId)) throw forbidden();
  } else {
    forbiddenUnless(req, 'projects', level);
  }
  return report;
}

export async function getDailyReports(req, res) {
  const { from, to, date, employee, q } = req.query;
  const filter = {};
  if (isEmployeeSession(req)) filter.employee = req.auth.employeeId;
  else {
    forbiddenUnless(req, 'projects');
    if (employee) filter.employee = String(employee);
    if (q) {
      const matches = await Employee.find({ name: new RegExp(escapeRegex(q), 'i') }).select('_id').lean();
      filter.employee = { $in: matches.map((e) => e._id) };
    }
  }
  if (date) filter.date = String(date);
  else if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = String(from);
    if (to) filter.date.$lte = String(to);
  }
  const reports = await DailyReport.find(filter).populate(POPULATE).sort({ date: -1, createdAt: -1 }).limit(1000).lean();
  res.json({ items: await withAttendance(reports) });
}

export async function createDailyReport(req, res) {
  const { date, tasks } = req.body;
  if (!isDayKey(date)) throw badRequest('Date is required.');
  const employee = isEmployeeSession(req) ? req.auth.employeeId : req.body.employee;
  if (!isEmployeeSession(req)) forbiddenUnless(req, 'projects', 'manage');
  if (!mongoose.isValidObjectId(employee)) throw badRequest('Choose an employee.');
  if (await DailyReport.exists({ employee, date })) throw conflict('A report already exists for that date. Edit it instead.');
  const report = await DailyReport.create({ employee, date, tasks: cleanTasks(tasks) });
  const [item] = await withAttendance([await DailyReport.findById(report._id).populate(POPULATE).lean()]);
  res.status(201).json({ item });
}

export async function updateDailyReport(req, res) {
  const report = await loadOwned(req, 'manage');
  report.tasks = cleanTasks(req.body.tasks);
  await report.save();
  const [item] = await withAttendance([await DailyReport.findById(report._id).populate(POPULATE).lean()]);
  res.json({ item });
}

export async function deleteDailyReport(req, res) {
  const report = await loadOwned(req, 'manage');
  await report.deleteOne();
  res.json({ ok: true });
}
