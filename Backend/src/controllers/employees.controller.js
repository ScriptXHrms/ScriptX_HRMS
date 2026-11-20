import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Attendance, Employee, Leave, nextSequence, Privilege, Task } from '../models/index.js';
import { fileRecord, UPLOAD_ROOT } from '../middleware/upload.js';
import { dayKey } from '../utils/dates.js';
import { badRequest, conflict, escapeRegex, notFound } from '../utils/http.js';

export const POPULATE = [
  { path: 'department', select: 'name' },
  { path: 'role', select: 'name' },
  { path: 'shift', select: 'name from to color' },
];

export const WRITABLE = [
  'name', 'email', 'phone', 'personalEmail', 'employeeType', 'experienceLevel', 'internDuration', 'department', 'role', 'shift',
  'dateOfJoining', 'confirmationDate', 'dateOfBirth', 'gender', 'maritalStatus', 'spouseName', 'fatherName', 'motherName',
  'address', 'pincode', 'permanentAddress', 'permanentPincode', 'linkedIn', 'driveLink', 'skills', 'panNo', 'aadharNo',
  'passportNo', 'passportExpiry', 'uanNo', 'epfoAccountNumber', 'pfJoinDate', 'pfExpiryDate', 'ipNumber', 'insuranceNo',
  'insuranceDate', 'bank', 'paymentType', 'salaryAmount', 'studentAmount', 'emergencyContacts', 'education', 'experience',
];

const RELIEVING_CHECKLIST = ['Handover completed', 'Company assets returned', 'Accounts and access revoked', 'Final settlement processed', 'Relieving letter issued'];

function pick(body, fields) {
  const data = {};
  fields.forEach((key) => {
    if (body[key] === undefined) return;
    data[key] = ['department', 'role', 'shift'].includes(key) && body[key] === '' ? null : body[key];
  });
  return data;
}

async function nextEmployeeId() {
  const year = dayKey().slice(0, 4);
  let id;
  do {
    const seq = await nextSequence(`employee_${year}`);
    id = `SX-${year}${String(seq).padStart(4, '0')}`;
  } while (await Employee.exists({ employeeId: id }));
  return id;
}

async function findOr404(id, query = Employee.findById(id)) {
  if (!mongoose.isValidObjectId(id)) throw notFound('Employee not found.');
  const employee = await query;
  if (!employee) throw notFound('Employee not found.');
  return employee;
}

async function removeUpload(url) {
  if (!url?.startsWith('/uploads/')) return;
  const target = path.join(UPLOAD_ROOT, url.replace('/uploads/', ''));
  await fs.unlink(target).catch(() => {});
}

export async function getMyProfile(req, res) {
  const employee = await Employee.findById(req.auth.employeeId).populate(POPULATE).lean();
  res.json({ item: employee });
}

export async function getEmployees(req, res) {
  const { q, status, department, role, employeeType } = req.query;
  const filter = {};
  if (status) filter.status = String(status);
  if (department) filter.department = String(department);
  if (role) filter.role = String(role);
  if (employeeType) filter.employeeType = String(employeeType);
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }, { employeeId: pattern }, { phone: pattern }];
  }
  const items = await Employee.find(filter).populate(POPULATE).sort({ name: 1 }).lean();
  res.json({ items, total: items.length });
}

export async function getEmployeeById(req, res) {
  const item = await findOr404(req.params.id, Employee.findById(req.params.id).populate(POPULATE).lean());
  res.json({ item });
}

export async function createEmployee(req, res) {
  const { password } = req.body;
  if (!password || String(password).length < 8) throw badRequest('Password must be at least 8 characters.');
  const created = await Employee.create({
    ...pick(req.body, WRITABLE),
    employeeId: await nextEmployeeId(),
    password: await bcrypt.hash(String(password), 10),
  });
  res.status(201).json({ item: await Employee.findById(created._id).populate(POPULATE).lean() });
}

export async function updateEmployee(req, res) {
  const employee = await findOr404(req.params.id);
  employee.set(pick(req.body, WRITABLE));
  await employee.save();
  res.json({ item: await Employee.findById(employee._id).populate(POPULATE).lean() });
}

export async function deleteEmployee(req, res) {
  const employee = await findOr404(req.params.id);
  if (employee.status !== 'Relieved') {
    const history = await Promise.all([
      Attendance.exists({ employee: employee._id }),
      Leave.exists({ employee: employee._id }),
      Task.exists({ assignedTo: employee._id }),
    ]);
    if (history.some(Boolean)) throw conflict('This employee has attendance, leave or task history. Use Relieve instead of deleting.');
  }
  await Privilege.deleteOne({ employee: employee._id });
  await employee.deleteOne();
  res.json({ ok: true });
}

export async function changeEmployeePassword(req, res) {
  const { password } = req.body;
  if (!password || String(password).length < 8) throw badRequest('Password must be at least 8 characters.');
  const employee = await findOr404(req.params.id);
  employee.password = await bcrypt.hash(String(password), 10);
  await employee.save();
  res.json({ ok: true });
}

export async function uploadEmployeePhoto(req, res) {
  if (!req.file) throw badRequest('Choose a photo to upload.');
  const employee = await findOr404(req.params.id);
  await removeUpload(employee.photo);
  employee.photo = fileRecord(req.file, 'employees').url;
  await employee.save();
  res.json({ photo: employee.photo });
}

export async function uploadEmployeeDocuments(req, res) {
  if (!req.file) throw badRequest('Choose a file to upload.');
  const title = String(req.body.title ?? '').trim() || 'Document';
  const employee = await findOr404(req.params.id);
  const group = employee.documents.find((d) => d.title === title);
  const record = fileRecord(req.file, 'employees');
  if (group) group.files.push(record);
  else employee.documents.push({ title, files: [record] });
  await employee.save();
  res.status(201).json({ documents: employee.documents });
}

export async function deleteEmployeeDocument(req, res) {
  const employee = await findOr404(req.params.id);
  const group = employee.documents.id(req.params.groupId);
  const file = group?.files.id(req.params.fileId);
  if (!file) throw notFound('Document not found.');
  await removeUpload(file.url);
  file.deleteOne();
  if (group.files.length === 0) group.deleteOne();
  await employee.save();
  res.json({ documents: employee.documents });
}

export async function startRelieving(req, res) {
  const { relievingType, resignationEmailDate, noticePeriod, lastWorkingDate, reason } = req.body;
  if (!lastWorkingDate) throw badRequest('Last working date is required.');
  const employee = await findOr404(req.params.id);
  if (employee.status === 'Relieved') throw conflict('This employee is already relieved.');
  employee.status = 'Relieving';
  employee.relieving = {
    relievingType: relievingType ?? 'Resignation',
    resignationEmailDate,
    noticePeriod,
    lastWorkingDate,
    reason,
    checklist: employee.relieving?.checklist?.length ? employee.relieving.checklist : RELIEVING_CHECKLIST.map((item) => ({ item })),
  };
  await employee.save();
  res.json({ item: await Employee.findById(employee._id).populate(POPULATE).lean() });
}

export async function updateRelievingChecklist(req, res) {
  const employee = await findOr404(req.params.id);
  if (!Array.isArray(req.body.checklist)) throw badRequest('Checklist is required.');
  employee.relieving.checklist = req.body.checklist.map(({ item, done }) => ({ item: String(item), done: Boolean(done) }));
  await employee.save();
  res.json({ item: await Employee.findById(employee._id).populate(POPULATE).lean() });
}

export async function completeRelieving(req, res) {
  const employee = await findOr404(req.params.id);
  if (employee.status !== 'Relieving') throw conflict('Start the relieving process first.');
  const pending = employee.relieving.checklist.filter((c) => !c.done);
  if (pending.length) throw conflict(`Finish the checklist first: ${pending.map((c) => c.item).join(', ')}.`);
  employee.status = 'Relieved';
  employee.relieving.relievedOn = dayKey();
  await employee.save();
  await Privilege.deleteOne({ employee: employee._id });
  res.json({ item: await Employee.findById(employee._id).populate(POPULATE).lean() });
}

export async function reactivateEmployee(req, res) {
  const employee = await findOr404(req.params.id);
  employee.status = 'Active';
  employee.relieving = undefined;
  await employee.save();
  res.json({ item: await Employee.findById(employee._id).populate(POPULATE).lean() });
}
