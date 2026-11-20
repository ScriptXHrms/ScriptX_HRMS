import mongoose from 'mongoose';
import { Employee, getSettings, PayrollOverride, SalaryPayment } from '../models/index.js';
import { buildMonthDays, loadRange, loadTaskLop, summarizeMonth } from '../utils/attendance.js';
import { dayKey, isDayKey, monthRange, parseMonth } from '../utils/dates.js';
import { badRequest, notFound } from '../utils/http.js';
import { applyOverrides, payFor } from '../utils/payroll.js';

function requireMonth(value) {
  const parsed = parseMonth(value ?? dayKey().slice(0, 7));
  if (!parsed) throw badRequest('Month must look like 2026-10.');
  return parsed;
}

export const getPayroll = async (req, res) => {
  const { year, month } = requireMonth(req.query.month);
  const range = monthRange(year, month);
  const filter = { status: { $ne: 'Relieved' }, dateOfJoining: { $lte: range.end } };
  if (req.query.employeeType === 'Intern') filter.employeeType = { $in: ['Intern', 'Freelancer'] };
  else filter.employeeType = { $in: ['Employee', 'Part Time'] };

  const employees = await Employee.find(filter)
    .select('name employeeId photo employeeType salaryAmount studentAmount dateOfJoining department role paymentType bank panNo uanNo shift')
    .populate('department', 'name')
    .populate('role', 'name')
    .sort({ name: 1 })
    .lean();

  const ids = employees.map((e) => e._id);
  const [ctx, settings, overrides, payments, taskLopMap] = await Promise.all([
    loadRange(ids, range.start, range.end),
    getSettings(),
    PayrollOverride.find({ employee: { $in: ids }, year, month }).lean(),
    SalaryPayment.find({ employee: { $in: ids }, year, month }).lean(),
    loadTaskLop(ids, range.start, range.end),
  ]);

  const items = employees.map((employee) => {
    const own = overrides.filter((o) => String(o.employee) === String(employee._id));
    const rawSummary = { ...summarizeMonth(buildMonthDays(employee, range, ctx), settings), taskLop: taskLopMap.get(String(employee._id)) ?? 0 };
    const attendance = applyOverrides(rawSummary, own);
    const { isStipend, pay } = payFor(employee, attendance, range.daysInMonth, settings);
    const payment = payments.find((p) => String(p.employee) === String(employee._id));
    return { employee, attendance, pay, isStipend, overrides: own, payment: payment ?? null };
  });

  const totals = items.reduce(
    (acc, row) => ({
      net: acc.net + row.pay.netSalary,
      paid: acc.paid + (row.payment?.status === 'Paid' ? row.pay.netSalary : 0),
      pending: acc.pending + (row.payment?.status === 'Paid' ? 0 : row.pay.netSalary),
    }),
    { net: 0, paid: 0, pending: 0 },
  );
  res.json({ range, items, totals });
};

export const updatePayrollOverride = async (req, res) => {
  const { employee, month: monthValue, field, value, note } = req.body;
  const { year, month } = requireMonth(monthValue);
  if (!mongoose.isValidObjectId(employee)) throw badRequest('Choose an employee.');
  if (!['payableDays', 'lop', 'lateLop', 'taskLop', 'tds'].includes(field)) throw badRequest('Unknown field.');
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw badRequest('Enter a valid number.');
  if (!String(note ?? '').trim()) throw badRequest('A note is required for manual changes.');
  if (await SalaryPayment.exists({ employee, year, month, status: 'Paid' })) throw badRequest('This month is already paid. Payroll can’t be changed.');

  const item = await PayrollOverride.findOneAndUpdate(
    { employee, year, month, field },
    { value: number, note: String(note).trim(), by: req.auth.account.name },
    { upsert: true, new: true, runValidators: true },
  );
  res.json({ item });
};

export const deletePayrollOverride = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound();
  const override = await PayrollOverride.findByIdAndDelete(req.params.id);
  if (!override) throw notFound('Override not found.');
  res.json({ ok: true });
};

export const markPayrollPaid = async (req, res) => {
  const { employees, month: monthValue, paymentDate, note, amounts = {} } = req.body;
  const { year, month } = requireMonth(monthValue);
  if (!Array.isArray(employees) || employees.length === 0) throw badRequest('Choose at least one employee.');
  if (!isDayKey(paymentDate)) throw badRequest('Payment date is required.');
  await SalaryPayment.bulkWrite(
    employees.map((employee) => ({
      updateOne: {
        filter: { employee, year, month },
        update: { status: 'Paid', paymentDate, note, netPaid: Number(amounts[employee]) || 0 },
        upsert: true,
      },
    })),
  );
  res.json({ ok: true, count: employees.length });
};
