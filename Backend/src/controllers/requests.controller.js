import mongoose from 'mongoose';
import { Employee, EmployeeRequest, Shift } from '../models/index.js';
import { dayKey, isDayKey } from '../utils/dates.js';
import { badRequest, conflict, escapeRegex, notFound } from '../utils/http.js';
import { notifyAdmins, notifyEmployees } from '../utils/notify.js';
import { resyncShiftRequest } from '../utils/shifts.js';

const POPULATE = [
  { path: 'employee', select: 'name employeeId photo' },
  { path: 'shift', select: 'name from to' },
];

/** A shift change needs a requested shift and a day (or a range) from today on. */
async function assertShiftRequest(employeeId, { shiftType, shift, fromDate, toDate }) {
  if (!['Single', 'Multiple'].includes(shiftType)) throw badRequest('Choose Single or Multiple.');
  if (!mongoose.isValidObjectId(shift) || !(await Shift.exists({ _id: shift }))) throw badRequest('Choose the requested shift.');
  if (!isDayKey(fromDate)) throw badRequest('From date is required.');
  if (fromDate < dayKey()) throw badRequest('A shift change can start today at the earliest.');
  const lastDay = shiftType === 'Single' ? fromDate : toDate;
  if (!isDayKey(lastDay) || lastDay < fromDate) throw badRequest('Choose a valid date range.');
  const pending = await EmployeeRequest.exists({ employee: employeeId, subject: 'Shift', status: 'Pending', fromDate: { $lte: lastDay }, toDate: { $gte: fromDate } });
  if (pending) throw conflict('You already have a pending shift change for these dates. Wait for HR, or withdraw it first.');
}

export const getMyRequests = async (req, res) => {
  const items = await EmployeeRequest.find({ employee: req.auth.employeeId }).populate('shift', 'name from to').sort({ createdAt: -1 }).lean();
  res.json({ items });
};

export const createMyRequest = async (req, res) => {
  const { date, subject, customSubject, message, shiftType, shift, startTime, endTime, fromDate, toDate } = req.body;
  if (subject === 'Other' && !String(customSubject ?? '').trim()) throw badRequest('Enter your subject.');
  if (subject === 'Shift') await assertShiftRequest(req.auth.employeeId, req.body);
  const item = await EmployeeRequest.create({
    employee: req.auth.employeeId,
    date,
    subject,
    customSubject,
    message,
    shiftType: subject === 'Shift' ? shiftType : '',
    shift: subject === 'Shift' && shift ? shift : undefined,
    startTime: subject === 'Shift' ? undefined : startTime,
    endTime: subject === 'Shift' ? undefined : endTime,
    fromDate,
    toDate: subject === 'Shift' && shiftType === 'Single' ? fromDate : toDate,
  });
  await notifyAdmins({ type: 'alert', title: 'New employee request', message: `${req.auth.account.name} · ${subject}`, link: '/admin/requests' });
  res.status(201).json({ item });
};

export const cancelMyRequest = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound();
  const request = await EmployeeRequest.findOne({ _id: req.params.id, employee: req.auth.employeeId });
  if (!request) throw notFound('Request not found.');
  if (request.status !== 'Pending') throw conflict('Only pending requests can be withdrawn.');
  await request.deleteOne();
  res.json({ ok: true });
};

export const getAdminRequests = async (req, res) => {
  const { status, subject, from, to, q } = req.query;
  const filter = {};
  if (status) filter.status = String(status);
  if (subject) filter.subject = String(subject);
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = String(from);
    if (to) filter.date.$lte = String(to);
  }
  if (q) {
    const matches = await Employee.find({ name: new RegExp(escapeRegex(q), 'i') }).select('_id').lean();
    filter.employee = { $in: matches.map((e) => e._id) };
  }
  const items = await EmployeeRequest.find(filter).populate(POPULATE).sort({ createdAt: -1 }).limit(1000).lean();
  res.json({ items, total: items.length });
};

export const updateRequestStatus = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound();
  const { status, notes } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) throw badRequest('Status must be Approved or Rejected.');
  if (status === 'Rejected' && !String(notes ?? '').trim()) throw badRequest('Add a note explaining the rejection.');
  const request = await EmployeeRequest.findById(req.params.id);
  if (!request) throw notFound('Request not found.');
  request.status = status;
  request.notes = notes;
  request.decidedBy = req.auth.account.name;
  await request.save();
  await resyncShiftRequest(request);
  await notifyEmployees([request.employee], {
    type: 'alert',
    title: `Request ${status.toLowerCase()}`,
    message: `${request.subject}${notes ? ` · ${notes}` : ''}`,
    link: '/employee/requests',
  });
  res.json({ item: await EmployeeRequest.findById(request._id).populate(POPULATE).lean() });
};

export const deleteRequest = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound();
  const request = await EmployeeRequest.findByIdAndDelete(req.params.id);
  if (!request) throw notFound('Request not found.');
  await resyncShiftRequest(request);
  res.json({ ok: true });
};
