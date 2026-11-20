import { Attendance, Holiday, Leave, LeaveType } from '../models/index.js';
import { dayKey, eachDay, isSunday, minutesOfDay, monthRange, timeToMinutes } from './dates.js';

const FULL_DAY_MINUTES = 480;
const HALF_DAY_MINUTES = 240;
// Logging in after 12:00 PM counts as a half day.
const HALF_DAY_LOGIN_AFTER = 12 * 60;

/**
 * Totals for one attendance record. Spans still open on the current day count
 * up to `now`; on past days an unfinished span is ignored.
 */
export function summarizeEntries(record, now = new Date()) {
  const entries = [...(record?.entries ?? [])].sort((a, b) => new Date(a.time) - new Date(b.time));
  const isToday = record?.date === dayKey(now);
  let workedMs = 0;
  let breakMs = 0;
  let breakCount = 0;
  let workStart = null;
  let breakStart = null;
  let login = null;
  let logout = null;
  const breaks = [];

  entries.forEach(({ reason, time }) => {
    const at = new Date(time);
    if (reason === 'Login' || reason === 'Break In') {
      if (reason === 'Login' && !login) login = at;
      if (reason === 'Break In' && breaks.length) breaks.at(-1).in = at;
      if (breakStart) breakMs += at - breakStart;
      breakStart = null;
      workStart = at;
    } else {
      if (workStart) workedMs += at - workStart;
      workStart = null;
      if (reason === 'Break Out') {
        breakStart = at;
        breakCount += 1;
        breaks.push({ out: at, in: null });
      } else {
        logout = at;
      }
    }
  });

  if (isToday) {
    if (workStart) workedMs += now - workStart;
    if (breakStart) breakMs += now - breakStart;
  }

  const last = entries.at(-1)?.reason;
  const state = !last ? 'not-started' : last === 'Logout' ? 'finished' : last === 'Break Out' ? 'on-break' : 'working';
  const payableMinutes = Math.round(workedMs / 60000);
  const breakMinutes = Math.round(breakMs / 60000);
  return {
    login,
    logout,
    state,
    breakCount,
    breaks,
    breakMinutes,
    payableMinutes,
    totalMinutes: payableMinutes + breakMinutes,
    // To the second, for "00:00:00" displays.
    payableSeconds: Math.round(workedMs / 1000),
    breakSeconds: Math.round(breakMs / 1000),
    totalSeconds: Math.round((workedMs + breakMs) / 1000),
  };
}

/** The reasons allowed next, given the last recorded entry. */
export function allowedReasons(state) {
  return {
    'not-started': ['Login'],
    working: ['Break Out', 'Logout'],
    'on-break': ['Break In'],
    finished: [],
  }[state];
}

export const leaveCovers = (leave, date) => leave.startDate <= date && date <= leave.endDate;

/**
 * Classifies one employee-day. `payable` is the fraction of a day that is paid:
 * 1 worked or paid-off day, 0.5 half day, 0 absent or unpaid leave.
 */
export function classifyDay({ date, today, joinDate, record, leaves, holidayReason, paidCodes }) {
  if (joinDate && date < joinDate) return { status: 'Not Joined', payable: null };
  if (date > today) return { status: holidayReason ? 'Holiday' : isSunday(date) ? 'Weekly Off' : 'Upcoming', payable: null, holidayReason };

  const leave = leaves.find((l) => l.status === 'Approved' && l.category === 'Leave' && leaveCovers(l, date));
  const halfLeave = leave && leave.duration !== 'Full Day';
  const leavePaid = leave ? paidCodes.has(leave.shortCode) : false;

  if (record?.entries?.length) {
    const summary = summarizeEntries(record);
    const shortDay = summary.state === 'finished' && summary.payableMinutes < HALF_DAY_MINUTES;
    const status = record.workType === 'WFH' ? 'Work From Home' : record.workType === 'On Duty' ? 'On Duty' : 'Present';
    // Working days only, and not for shifts that start at or after noon. Like a short day, a half-day leave
    // (morning off, afternoon in) is the one leave that keeps it a full day.
    const shiftStart = timeToMinutes(record.shiftFrom);
    const lateHalf =
      !holidayReason && !isSunday(date) && summary.login && minutesOfDay(summary.login) > HALF_DAY_LOGIN_AFTER && (shiftStart === null || shiftStart < HALF_DAY_LOGIN_AFTER);
    if ((shortDay || lateHalf) && !halfLeave) return { status: 'Half Day', payable: 0.5, summary };
    return { status, payable: halfLeave && !leavePaid ? 0.5 : 1, summary, leave };
  }
  if (leave) {
    if (halfLeave) return { status: 'Half Day', payable: leavePaid ? 0.5 : 0, leave };
    return { status: 'On Leave', payable: leavePaid ? 1 : 0, leave };
  }
  if (holidayReason) return { status: 'Holiday', payable: 1, holidayReason };
  if (isSunday(date)) return { status: 'Weekly Off', payable: 1 };
  return { status: 'Absent', payable: 0 };
}

export const STATUS_CODES = {
  Present: 'P',
  'Work From Home': 'WFH',
  'On Duty': 'OD',
  'Half Day': 'HD',
  'On Leave': 'L',
  Absent: 'A',
  Holiday: 'H',
  'Weekly Off': 'WO',
  'Not Joined': '-',
  Upcoming: '',
};

/** Everything needed to classify many employee-days in a date range. */
export async function loadRange(employeeIds, start, end) {
  const [records, leaves, holidays, leaveTypes] = await Promise.all([
    Attendance.find({ employee: { $in: employeeIds }, date: { $gte: start, $lte: end } }).lean(),
    Leave.find({ employee: { $in: employeeIds }, status: 'Approved', startDate: { $lte: end }, endDate: { $gte: start } }).lean(),
    Holiday.find({ date: { $gte: start, $lte: end } }).lean(),
    LeaveType.find({ paid: true }).lean(),
  ]);

  const recordIndex = new Map(records.map((r) => [`${r.employee}|${r.date}`, r]));
  const leaveIndex = new Map();
  leaves.forEach((leave) => {
    const key = String(leave.employee);
    leaveIndex.set(key, [...(leaveIndex.get(key) ?? []), leave]);
  });

  return {
    holidays: new Map(holidays.map((h) => [h.date, h.reason])),
    paidCodes: new Set(leaveTypes.map((t) => t.shortCode)),
    recordFor: (employeeId, date) => recordIndex.get(`${employeeId}|${date}`),
    leavesFor: (employeeId) => leaveIndex.get(String(employeeId)) ?? [],
  };
}

/** One day row per calendar day of the month, for one employee. */
export function buildMonthDays(employee, range, ctx) {
  const today = dayKey();
  return eachDay(range.start, range.end).map((date) => {
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
    return { date, record, ...day };
  });
}

/** Month totals used by Overall Attendance, Payroll and the leave report. */
export function summarizeMonth(days, settings) {
  const totals = {
    present: 0,
    wfh: 0,
    onDuty: 0,
    halfDay: 0,
    halfDayWorked: 0,
    lessThan8: 0,
    late: 0,
    absent: 0,
    leave: 0,
    paidLeave: 0,
    unpaidLeave: 0,
    holidays: 0,
    weeklyOffs: 0,
    payableMinutes: 0,
    eligibleDays: 0,
    earnedDays: 0,
  };

  days.forEach((day) => {
    if (day.payable === null) return;
    totals.eligibleDays += 1;
    totals.earnedDays += day.payable;
    if (day.status === 'Present') totals.present += 1;
    else if (day.status === 'Work From Home') totals.wfh += 1;
    else if (day.status === 'On Duty') totals.onDuty += 1;
    else if (day.status === 'Half Day') totals.halfDay += 1;
    else if (day.status === 'Absent') totals.absent += 1;
    else if (day.status === 'Holiday') totals.holidays += 1;
    else if (day.status === 'Weekly Off') totals.weeklyOffs += 1;
    if (day.leave) {
      const portion = day.leave.duration === 'Full Day' ? 1 : 0.5;
      totals.leave += portion;
      if (day.payable > 0 && day.status === 'On Leave') totals.paidLeave += portion;
      else if (day.payable === 0) totals.unpaidLeave += portion;
      else if (day.status === 'Half Day') totals.paidLeave += portion;
    }
    if (day.record?.isLate) totals.late += 1;
    if (day.summary) {
      // A half day the employee actually logged in for, as opposed to a half-day leave with no punches.
      if (day.status === 'Half Day') totals.halfDayWorked += 1;
      totals.payableMinutes += day.summary.payableMinutes;
      if (day.summary.state === 'finished' && day.summary.payableMinutes < FULL_DAY_MINUTES) totals.lessThan8 += 1;
    }
  });

  const lateUnit = settings.lateLopType === 'Full Day' ? 1 : 0.5;
  const lateLop = settings.lateLopDays > 0 ? Math.floor(totals.late / settings.lateLopDays) * lateUnit : 0;
  const lop = totals.eligibleDays - totals.earnedDays;
  return { ...totals, lateLop, lop, payableDays: Math.max(0, totals.earnedDays - lateLop) };
}

export { monthRange };
