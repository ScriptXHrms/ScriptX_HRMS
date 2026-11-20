import mongoose from 'mongoose';
import { Employee, getSettings, Holiday, Leave, LeaveType } from '../models/index.js';
import { fileRecord } from '../middleware/upload.js';
import { dayKey, eachDay, isDayKey, isSunday, monthRange, parseMonth, timeToMinutes } from '../utils/dates.js';
import { badRequest, conflict, escapeRegex, notFound } from '../utils/http.js';
import { leaveBalance } from '../utils/leaveBalance.js';
import { notifyAdmins, notifyEmployees } from '../utils/notify.js';
import { forbiddenUnless } from '../middleware/access.js';

const EMPLOYEE_FIELDS = 'name employeeId photo employeeType department role';
const POPULATE = {
  path: 'employee',
  select: EMPLOYEE_FIELDS,
  populate: [
    { path: 'department', select: 'name' },
    { path: 'role', select: 'name' },
  ],
};

const moduleFor = (category) => (category === 'WFH' ? 'wfh' : 'leave');
const adminLink = (category) => (category === 'WFH' ? '/admin/wfh' : '/admin/leaves');
const employeeLink = (category) => (category === 'WFH' ? '/employee/wfh' : '/employee/leaves');

async function countDays({ startDate, endDate, duration, category }) {
  if (category === 'Permission') return 0;
  if (duration === 'First Half' || duration === 'Second Half') return 0.5;
  const holidays = await Holiday.find({ date: { $gte: startDate, $lte: endDate } }).select('date').lean();
  const closed = new Set(holidays.map((h) => h.date));
  return eachDay(startDate, endDate).filter((d) => !isSunday(d) && !closed.has(d)).length;
}

/** Name and short code of an active leave type. The short code decides whether the leave is paid. */
async function leaveTypeFields(name) {
  const type = name ? await LeaveType.findOne({ name, status: 'Active' }).lean() : null;
  if (!type) throw badRequest('Choose a leave type.');
  return { leaveType: type.name, shortCode: type.shortCode };
}

/** `withType: false` leaves a Leave request untyped; HR sets the type when approving it. */
async function buildLeave(body, employeeId, { withType = true } = {}) {
  const { category = 'Leave', leaveType, startDate, endDate, startTime, endTime, reason } = body;
  let { duration = 'Full Day' } = body;
  if (!['Leave', 'Permission', 'WFH'].includes(category)) throw badRequest('Unknown request type.');
  const end = category === 'Permission' || duration !== 'Full Day' ? startDate : endDate;
  if (!isDayKey(startDate) || !isDayKey(end)) throw badRequest('Choose valid dates.');
  if (end < startDate) throw badRequest('End date can’t be before the start date.');
  if (!String(reason ?? '').trim()) throw badRequest('Reason is required.');

  const data = { employee: employeeId, category, startDate, endDate: end, reason: String(reason).trim() };

  if (category === 'Leave') {
    if (withType) Object.assign(data, await leaveTypeFields(leaveType));
  } else if (category === 'WFH') {
    data.leaveType = 'Work From Home';
    data.shortCode = 'WFH';
  } else {
    const from = timeToMinutes(startTime);
    const to = timeToMinutes(endTime);
    if (from === null || to === null || to <= from) throw badRequest('Permission end time must be after the start time.');
    const settings = await getSettings();
    if (to - from > settings.permissionHours * 60) throw badRequest(`Permission can’t be longer than ${settings.permissionHours} hours.`);
    Object.assign(data, { leaveType: 'Permission', shortCode: 'PER', startTime, endTime });
    duration = 'Hours';
  }

  data.duration = duration;
  data.days = await countDays({ ...data, duration });
  if (category !== 'Permission' && data.days === 0) throw badRequest('Those dates fall on Sundays or holidays.');

  const overlap = await Leave.exists({
    employee: employeeId,
    category,
    status: { $in: ['Pending', 'Approved'] },
    startDate: { $lte: data.endDate },
    endDate: { $gte: data.startDate },
  });
  if (overlap) throw conflict('You already have a request covering those dates.');
  return data;
}

export const getMyLeaves = async (req, res) => {
  const filter = { employee: req.auth.employeeId };
  if (req.query.category) filter.category = String(req.query.category);
  const items = await Leave.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ items });
};

export const applyLeave = async (req, res) => {
  const data = await buildLeave(req.body, req.auth.employeeId, { withType: false });
  if (data.category === 'WFH') {
    const { wfh } = await leaveBalance(req.auth.employeeId);
    if (data.startDate.startsWith(dayKey().slice(0, 7)) && wfh.used + data.days > wfh.allowance) {
      throw conflict(`You've reached this month's limit of ${wfh.allowance} work from home days.`);
    }
  }
  if (req.file) data.attachment = fileRecord(req.file, 'leaves');
  const item = await Leave.create(data);
  await notifyAdmins({
    type: 'leave',
    title: data.category === 'WFH' ? 'New WFH request' : data.category === 'Permission' ? 'New permission request' : 'New leave request',
    message: `${req.auth.account.name} · ${data.startDate}${data.endDate !== data.startDate ? ` to ${data.endDate}` : ''}`,
    link: adminLink(data.category),
  });
  res.status(201).json({ item });
};

export const cancelMyLeave = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound();
  const leave = await Leave.findOne({ _id: req.params.id, employee: req.auth.employeeId });
  if (!leave) throw notFound('Request not found.');
  if (leave.status !== 'Pending') throw conflict('Only pending requests can be cancelled.');
  leave.status = 'Cancelled';
  await leave.save();
  res.json({ item: leave });
};

export const getAdminLeaves = async (req, res) => {
  const category = String(req.query.category ?? 'Leave');
  const categories = category === 'Leave' ? ['Leave', 'Permission'] : [category];
  forbiddenUnless(req, moduleFor(category));

  const { status, from, to, employee, q, createdBy } = req.query;
  const filter = { category: { $in: categories } };
  if (req.query.subCategory) filter.category = String(req.query.subCategory);
  if (status === 'Processed') filter.status = { $in: ['Approved', 'Rejected', 'Cancelled'] };
  else if (status) filter.status = String(status);
  if (from) filter.endDate = { $gte: String(from) };
  if (to) filter.startDate = { $lte: String(to) };
  if (employee) filter.employee = String(employee);
  if (createdBy) filter.createdBy = String(createdBy);
  if (q) {
    const matches = await Employee.find({ name: new RegExp(escapeRegex(q), 'i') }).select('_id').lean();
    filter.employee = { $in: matches.map((e) => e._id) };
  }
  const items = await Leave.find(filter).populate(POPULATE).sort({ createdAt: -1 }).limit(1000).lean();
  res.json({ items, total: items.length });
};

export const createAdminLeave = async (req, res) => {
  const category = String(req.body.category ?? 'Leave');
  forbiddenUnless(req, moduleFor(category), 'manage');
  if (!mongoose.isValidObjectId(req.body.employee)) throw badRequest('Choose an employee.');
  const data = await buildLeave(req.body, req.body.employee);
  const item = await Leave.create({
    ...data,
    status: 'Approved',
    createdBy: 'admin',
    decidedBy: req.auth.account.name,
    decidedAt: new Date(),
    note: req.body.note,
  });
  res.status(201).json({ item: await Leave.findById(item._id).populate(POPULATE).lean() });
};

export const getLeaveReport = async (req, res) => {
  forbiddenUnless(req, 'leave');
  const parsed = parseMonth(req.query.month ?? dayKey().slice(0, 7));
  if (!parsed) throw badRequest('Month must look like 2026-10.');
  const range = monthRange(parsed.year, parsed.month);
  const [employees, leaves] = await Promise.all([
    Employee.find({ status: { $ne: 'Relieved' } }).select('name employeeId photo').sort({ name: 1 }).lean(),
    Leave.find({ startDate: { $lte: range.end }, endDate: { $gte: range.start }, category: { $in: ['Leave', 'Permission'] } }).lean(),
  ]);
  const items = employees.map((employee) => {
    const own = leaves.filter((l) => String(l.employee) === String(employee._id));
    const approved = own.filter((l) => l.status === 'Approved');
    return {
      employee,
      leaveDays: approved.filter((l) => l.category === 'Leave').reduce((total, l) => total + l.days, 0),
      permissions: approved.filter((l) => l.category === 'Permission').length,
      pending: own.filter((l) => l.status === 'Pending').length,
      rejected: own.filter((l) => l.status === 'Rejected').length,
      byType: approved
        .filter((l) => l.category === 'Leave')
        .reduce((acc, l) => ({ ...acc, [l.shortCode]: (acc[l.shortCode] ?? 0) + l.days }), {}),
    };
  });
  res.json({ range, items });
};

export const updateLeaveStatus = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound();
  const leave = await Leave.findById(req.params.id);
  if (!leave) throw notFound('Request not found.');
  forbiddenUnless(req, moduleFor(leave.category), 'manage');

  const { status, note } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) throw badRequest('Status must be Approved or Rejected.');
  if (status === 'Rejected' && !String(note ?? '').trim()) throw badRequest('Add a reason so the employee knows why it was rejected.');

  if (status === 'Approved' && leave.category === 'Leave') leave.set(await leaveTypeFields(req.body.leaveType ?? leave.leaveType));
  leave.status = status;
  leave.note = note;
  leave.decidedBy = req.auth.account.name;
  leave.decidedAt = new Date();
  await leave.save();
  await notifyEmployees([leave.employee], {
    type: 'leave',
    title: `${leave.leaveType ?? 'Leave'} ${status.toLowerCase()}`,
    message: `${leave.startDate}${leave.endDate !== leave.startDate ? ` to ${leave.endDate}` : ''}${note ? ` · ${note}` : ''}`,
    link: employeeLink(leave.category),
  });
  res.json({ item: await Leave.findById(leave._id).populate(POPULATE).lean() });
};

export const deleteLeave = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound();
  const leave = await Leave.findById(req.params.id);
  if (!leave) throw notFound('Request not found.');
  forbiddenUnless(req, moduleFor(leave.category), 'manage');
  await leave.deleteOne();
  res.json({ ok: true });
};
