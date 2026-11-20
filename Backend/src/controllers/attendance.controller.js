import mongoose from 'mongoose';
import { Attendance, DailyReport, Employee, getSettings, Leave, LeaveType, PayrollOverride } from '../models/index.js';
import {
  allowedReasons,
  buildMonthDays,
  classifyDay,
  loadRange,
  loadTaskLop,
  STATUS_CODES,
  summarizeEntries,
  summarizeMonth,
} from '../utils/attendance.js';
import { dayKey, isDayKey, minutesOfDay, monthRange, parseMonth, timeToMinutes } from '../utils/dates.js';
import { badRequest, conflict, notFound } from '../utils/http.js';
import { applyOverrides, payFor } from '../utils/payroll.js';
import { lateMinutes, SHIFT_FIELDS, shiftChanges, shiftChangesOn, shiftOn, shiftSnapshot } from '../utils/shifts.js';

const IDENTITY = 'name employeeId photo shift dateOfJoining department role employeeType';

function serialize(record) {
  if (!record) return null;
  const { login, logout, ...rest } = summarizeEntries(record);
  return { ...record, login, logout, ...rest, allowed: allowedReasons(rest.state) };
}

function requireMonth(value) {
  const parsed = parseMonth(value ?? dayKey().slice(0, 7));
  if (!parsed) throw badRequest('Month must look like 2026-10.');
  return parsed;
}

const companyTimestamp = (date, time) => new Date(`${date}T${time}:00+05:30`);
const approvedWfhOn = (employeeId, date) => Leave.exists({ employee: employeeId, category: 'WFH', status: 'Approved', startDate: { $lte: date }, endDate: { $gte: date } });

function buildEntries(date, loginTime, logoutTime) {
  if (timeToMinutes(loginTime) === null) throw badRequest('Login time is required.');
  const entries = [{ reason: 'Login', time: companyTimestamp(date, loginTime) }];
  if (logoutTime) {
    if (timeToMinutes(logoutTime) === null) throw badRequest('Logout time is invalid.');
    if (timeToMinutes(logoutTime) <= timeToMinutes(loginTime)) throw badRequest('Logout time must be after login time.');
    entries.push({ reason: 'Logout', time: companyTimestamp(date, logoutTime) });
  }
  return entries;
}

async function monthDetail(employeeId, year, month) {
  const employee = await Employee.findById(employeeId).select(IDENTITY).populate(SHIFT_FIELDS).populate('role', 'name').lean();
  if (!employee) throw notFound('Employee not found.');
  const range = monthRange(year, month);
  const [ctx, settings, reports, changes, leaveTypes] = await Promise.all([
    loadRange([employee._id], range.start, range.end),
    getSettings(),
    DailyReport.find({ employee: employee._id, date: { $gte: range.start, $lte: range.end } }).lean(),
    shiftChanges(employee._id, range.start, range.end),
    LeaveType.find({ status: 'Active' }).select('name').sort({ name: 1 }).lean(),
  ]);
  const reportFor = new Map(reports.map((r) => [r.date, r]));
  const days = buildMonthDays(employee, range, ctx);

  const leaveDays = new Map(leaveTypes.map((type) => [type.name, 0]));
  days.forEach((day) => {
    if (!day.leave || day.payable === null) return;
    leaveDays.set(day.leave.leaveType, (leaveDays.get(day.leave.leaveType) ?? 0) + (day.leave.duration === 'Full Day' ? 1 : 0.5));
  });
  const permissions = ctx.leavesFor(employee._id).filter((l) => l.category === 'Permission' && l.startDate >= range.start && l.startDate <= range.end).length;

  return {
    employee,
    summary: summarizeMonth(days, settings),
    breakdown: { leaveTypes: [...leaveDays].map(([name, count]) => ({ name, days: count })), permissions },
    days: days.map(({ record, leave, ...day }) => ({
      ...day,
      id: record?._id,
      workType: record?.workType,
      shiftName: record?.shiftName ?? (changes.get(day.date) ?? employee.shift)?.name,
      loginDelay: day.summary?.login && timeToMinutes(record?.shiftFrom) !== null ? minutesOfDay(day.summary.login) - timeToMinutes(record.shiftFrom) : null,
      shiftFrom: record?.shiftFrom ?? null,
      autoLogout: record?.autoLogout ?? false,
      isLate: record?.isLate ?? false,
      lateMinutes: record?.lateMinutes ?? 0,
      leaveType: leave?.leaveType,
      projectStart: reportFor.get(day.date)?.tasks[0]?.startTime ?? null,
      taskMinutes: (reportFor.get(day.date)?.tasks ?? []).reduce((total, t) => total + Math.max(0, timeToMinutes(t.endTime) - timeToMinutes(t.startTime)), 0),
    })),
  };
}

export async function getTodayAttendance(req, res) {
  const today = dayKey();
  const [record, employee, settings, approvedWfh] = await Promise.all([
    Attendance.findOne({ employee: req.auth.employeeId, date: today }).lean(),
    Employee.findById(req.auth.employeeId).populate(SHIFT_FIELDS).lean(),
    getSettings(),
    approvedWfhOn(req.auth.employeeId, today),
  ]);
  const empty = { date: today, entries: [], state: 'not-started', allowed: ['Login'], payableMinutes: 0, breakMinutes: 0, breakCount: 0, totalMinutes: 0 };
  res.json({
    item: serialize(record) ?? empty,
    shift: await shiftOn(employee, today),
    graceMinutes: settings.lateGraceMinutes,
    workType: approvedWfh ? 'WFH' : 'WFO',
  });
}

export async function markAttendance(req, res) {
  const { reason } = req.body;
  const now = new Date();
  const date = dayKey(now);
  const employee = await Employee.findById(req.auth.employeeId).populate(SHIFT_FIELDS);
  let record = await Attendance.findOne({ employee: employee._id, date });

  const state = record ? summarizeEntries(record, now).state : 'not-started';
  const allowed = allowedReasons(state);
  if (!allowed.includes(reason)) {
    if (state === 'finished') throw conflict('You have already logged out today.');
    if (state === 'not-started') throw conflict('Log in first.');
    throw conflict(`You can only ${allowed.join(' or ').toLowerCase()} right now.`);
  }

  if (reason === 'Login') {
    const [settings, approvedWfh, shift] = await Promise.all([
      getSettings(),
      approvedWfhOn(employee._id, date),
      shiftOn(employee, date),
    ]);
    const late = lateMinutes(shift, minutesOfDay(now), settings.lateGraceMinutes);
    record = await Attendance.create({
      employee: employee._id,
      date,
      ...shiftSnapshot(shift),
      workType: approvedWfh ? 'WFH' : 'Office',
      entries: [{ reason, time: now }],
      isLate: late > 0,
      lateMinutes: late,
    });
  } else {
    record.entries.push({ reason, time: now });
    await record.save();
  }
  res.json({ item: serialize(record.toObject()) });
}

export async function getMyMonth(req, res) {
  const { year, month } = requireMonth(req.query.month);
  const [detail, employee, overrides, settings] = await Promise.all([
    monthDetail(req.auth.employeeId, year, month),
    Employee.findById(req.auth.employeeId).select('employeeType salaryAmount studentAmount').lean(),
    PayrollOverride.find({ employee: req.auth.employeeId, year, month }).lean(),
    getSettings(),
  ]);
  const range = monthRange(year, month);
  // Load task LOP for this employee
  const taskLopMap = await loadTaskLop([req.auth.employeeId], range.start, range.end);
  const rawSummary = { ...detail.summary, taskLop: taskLopMap.get(String(req.auth.employeeId)) ?? 0 };
  const summary = applyOverrides(rawSummary, overrides);
  res.json({ ...detail, summary, pay: { ...payFor(employee, summary, range.daysInMonth, settings), daysInMonth: range.daysInMonth } });
}

export async function getDaily(req, res) {
  const date = isDayKey(req.query.date) ? req.query.date : dayKey();
  const employees = await Employee.find({ status: { $ne: 'Relieved' } })
    .select(IDENTITY)
    .populate(SHIFT_FIELDS)
    .populate('department', 'name')
    .populate('role', 'name')
    .sort({ name: 1 })
    .lean();
  const [ctx, changes] = await Promise.all([loadRange(employees.map((e) => e._id), date, date), shiftChangesOn(employees.map((e) => e._id), date)]);
  const today = dayKey();

  const items = employees
    .map(({ shift, ...rest }) => {
      const employee = { ...rest, shift: changes.get(String(rest._id)) ?? shift };
      const record = ctx.recordFor(employee._id, date);
      const day = classifyDay({
        date,
        today,
        joinDate: employee.dateOfJoining,
        record,
        leaves: ctx.leavesFor(employee._id),
        holidayReason: ctx.holidays.get(date),
        paidCodes: ctx.paidCodes,
      });
      return {
        employee,
        status: day.status,
        leaveType: day.leave?.leaveType ?? null,
        holidayReason: day.holidayReason ?? null,
        record: serialize(record),
      };
    })
    .filter((row) => row.status !== 'Not Joined');

  const summary = items.reduce((acc, row) => ({ ...acc, [row.status]: (acc[row.status] ?? 0) + 1 }), { total: items.length });
  res.json({ date, items, summary });
}

export async function getTracker(req, res) {
  const { year, month } = requireMonth(req.query.month);
  const range = monthRange(year, month);
  const employees = await Employee.find({ status: { $ne: 'Relieved' } }).select(IDENTITY).populate('department', 'name').sort({ name: 1 }).lean();
  const [ctx, settings] = await Promise.all([loadRange(employees.map((e) => e._id), range.start, range.end), getSettings()]);
  const items = employees.map((employee) => {
    const days = buildMonthDays(employee, range, ctx);
    return {
      employee,
      days: days.map((d) => ({ date: d.date, status: d.status, code: STATUS_CODES[d.status], leaveType: d.leave?.leaveType, late: d.record?.isLate ?? false })),
      summary: summarizeMonth(days, settings),
    };
  });
  res.json({ range, items });
}

export async function getMonthly(req, res) {
  const { year, month } = requireMonth(req.query.month);
  if (!mongoose.isValidObjectId(req.query.employee)) throw badRequest('Choose an employee.');
  res.json(await monthDetail(req.query.employee, year, month));
}

export async function getOverall(req, res) {
  const { year, month } = requireMonth(req.query.month);
  const filter = { status: { $ne: 'Relieved' } };
  if (req.query.employeeType) filter.employeeType = String(req.query.employeeType);
  const employees = await Employee.find(filter).select(IDENTITY).populate('department', 'name').populate('role', 'name').sort({ name: 1 }).lean();
  const range = monthRange(year, month);
  const [ctx, settings, overrides] = await Promise.all([
    loadRange(employees.map((e) => e._id), range.start, range.end),
    getSettings(),
    PayrollOverride.find({ year, month }).lean(),
  ]);
  const items = employees.map((employee) => {
    const summary = summarizeMonth(buildMonthDays(employee, range, ctx), settings);
    const own = overrides.filter((o) => String(o.employee) === String(employee._id));
    return { employee, summary, overrides: own };
  });
  res.json({ range, items });
}

export async function getAdminMarks(req, res) {
  const { year, month } = requireMonth(req.query.month);
  const range = monthRange(year, month);
  const records = await Attendance.find({ markedBy: 'admin', date: { $gte: range.start, $lte: range.end } })
    .populate('employee', 'name employeeId')
    .sort({ date: -1 })
    .lean();
  res.json({ items: records.map(serialize) });
}

export async function createAdminMark(req, res) {
  const { employee: employeeId, date, workType, loginTime, logoutTime, notes } = req.body;
  if (!mongoose.isValidObjectId(employeeId)) throw badRequest('Choose an employee.');
  if (!isDayKey(date)) throw badRequest('Date is required.');
  if (date > dayKey()) throw badRequest('Attendance can’t be added for a future date.');

  const employee = await Employee.findById(employeeId).populate(SHIFT_FIELDS);
  if (!employee) throw notFound('Employee not found.');
  if (await Attendance.exists({ employee: employee._id, date })) throw conflict('Attendance already exists for this employee on that date. Edit it instead.');

  const entries = buildEntries(date, loginTime, logoutTime);
  const [settings, shift] = await Promise.all([getSettings(), shiftOn(employee, date)]);
  const late = lateMinutes(shift, timeToMinutes(loginTime), settings.lateGraceMinutes);
  const record = await Attendance.create({
    employee: employee._id,
    date,
    ...shiftSnapshot(shift),
    workType: ['Office', 'WFH', 'On Duty'].includes(workType) ? workType : 'On Duty',
    entries,
    isLate: late > 0,
    lateMinutes: late,
    markedBy: 'admin',
    notes,
  });
  res.status(201).json({ item: serialize(record.toObject()) });
}

export async function updateAttendance(req, res) {
  const { loginTime, logoutTime, workType, notes } = req.body;
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound();
  const record = await Attendance.findById(req.params.id);
  if (!record) throw notFound('Attendance record not found.');

  const breaks = record.entries.filter((e) => e.reason === 'Break Out' || e.reason === 'Break In');
  record.entries = [...buildEntries(record.date, loginTime, logoutTime), ...breaks];
  if (['Office', 'WFH', 'On Duty'].includes(workType)) record.workType = workType;
  if (notes !== undefined) record.notes = notes;
  record.autoLogout = false;

  const settings = await getSettings();
  record.lateMinutes = lateMinutes({ from: record.shiftFrom }, timeToMinutes(loginTime), settings.lateGraceMinutes);
  record.isLate = record.lateMinutes > 0;
  record.editLog.push({ by: req.auth.account.name, at: new Date() });
  await record.save();
  res.json({ item: serialize(record.toObject()) });
}

export async function deleteAttendance(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound();
  const record = await Attendance.findByIdAndDelete(req.params.id);
  if (!record) throw notFound('Attendance record not found.');
  res.json({ ok: true });
}
