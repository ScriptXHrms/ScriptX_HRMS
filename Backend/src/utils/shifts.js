import { Attendance, Employee, EmployeeRequest, getSettings } from '../models/index.js';
import { eachDay, minutesOfDay, timeToMinutes } from './dates.js';

export const SHIFT_FIELDS = { path: 'shift', select: 'name from to color' };

/** Shift fields copied onto an attendance record. Undefined keys clear an older copy. */
export const shiftSnapshot = (shift) => ({ shift: shift?._id, shiftName: shift?.name, shiftFrom: shift?.from, shiftTo: shift?.to });

export function lateMinutes(shift, loginMinutes, graceMinutes) {
  const start = timeToMinutes(shift?.from);
  return start === null || loginMinutes === null ? 0 : Math.max(0, loginMinutes - start - graceMinutes);
}

/** The shift a request asks for, marked so the portals can say it is a change. */
const requestedShift = (request) => (request.shift ? { ...request.shift, changed: true } : null);

/**
 * Approved shift changes between two day keys, as Map(date -> shift).
 * When requests overlap, the one decided last wins. Days outside every request
 * fall back to the employee's normal shift.
 */
export async function shiftChanges(employeeId, start, end) {
  const requests = await EmployeeRequest.find({ employee: employeeId, subject: 'Shift', status: 'Approved', fromDate: { $lte: end }, toDate: { $gte: start } })
    .populate(SHIFT_FIELDS)
    .sort({ updatedAt: 1 })
    .lean();
  const byDate = new Map();
  for (const request of requests) {
    const shift = requestedShift(request);
    if (!shift) continue;
    const from = request.fromDate > start ? request.fromDate : start;
    const to = request.toDate < end ? request.toDate : end;
    eachDay(from, to).forEach((date) => byDate.set(date, shift));
  }
  return byDate;
}

/** Approved shift changes for many employees on one day, as Map(employeeId -> shift). */
export async function shiftChangesOn(employeeIds, date) {
  const requests = await EmployeeRequest.find({ employee: { $in: employeeIds }, subject: 'Shift', status: 'Approved', fromDate: { $lte: date }, toDate: { $gte: date } })
    .populate(SHIFT_FIELDS)
    .sort({ updatedAt: 1 })
    .lean();
  const byEmployee = new Map();
  for (const request of requests) {
    const shift = requestedShift(request);
    if (shift) byEmployee.set(String(request.employee), shift);
  }
  return byEmployee;
}

/** `employee` must have its shift populated. */
export async function shiftOn(employee, date) {
  return (await shiftChangesOn([employee._id], date)).get(String(employee._id)) ?? employee.shift ?? null;
}

/** Re-applies the right shift and lateness to attendance already recorded in a shift request's dates. */
export async function resyncShiftRequest(request) {
  if (request.subject !== 'Shift' || !request.fromDate || !request.toDate) return;
  const records = await Attendance.find({ employee: request.employee, date: { $gte: request.fromDate, $lte: request.toDate } });
  if (!records.length) return;
  const [employee, changes, settings] = await Promise.all([
    Employee.findById(request.employee).populate(SHIFT_FIELDS).lean(),
    shiftChanges(request.employee, request.fromDate, request.toDate),
    getSettings(),
  ]);
  for (const record of records) {
    const shift = changes.get(record.date) ?? employee?.shift ?? null;
    const login = record.entries.find((entry) => entry.reason === 'Login');
    record.set(shiftSnapshot(shift));
    record.lateMinutes = lateMinutes(shift, login ? minutesOfDay(login.time) : null, settings.lateGraceMinutes);
    record.isLate = record.lateMinutes > 0;
    await record.save();
  }
}
