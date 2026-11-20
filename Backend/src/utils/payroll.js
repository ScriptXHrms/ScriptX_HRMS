const round = (value) => Math.round(value * 100) / 100;

const PF_WAGE_CAP = 1800;
const ESI_GROSS_LIMIT = 21000;

/** Monthly gross is directly the salary amount (no PF deduction from gross). */
function grossFromCtc(ctc) {
  return Number(ctc) || 0;
}

/**
 * Salary breakdown for one employee-month.
 * `ctc` is the monthly CTC.
 * `workingDays` = days in month minus Sundays minus Holidays.
 * Per-day salary = gross / workingDays.
 * Earned = gross - (lopDays * perDay).
 * Net = Earned (no PF / PT deductions).
 */
export function calculateSalary({ ctc, payableDays, workingDays, daysInMonth, lopDays = 0 }) {
  const gross = grossFromCtc(ctc);
  const perDay = workingDays > 0 ? gross / workingDays : 0;
  const lopDeduction = lopDays * perDay;
  const actualGross = Math.max(0, gross - lopDeduction);
  const netSalary = actualGross;

  return Object.fromEntries(
    Object.entries({
      ctc,
      gross,
      perDay,
      workingDays,
      payableDays,
      lopDays,
      lopDeduction,
      actualGross,
      netSalary,
    }).map(([key, value]) => [key, round(value)]),
  );
}

/** Interns and freelancers get a flat stipend pro-rated by payable days, with no statutory deductions. */
export function calculateStipend({ amount, payableDays, workingDays, daysInMonth, lopDays = 0, tds = 0 }) {
  const perDay = workingDays > 0 ? amount / workingDays : 0;
  const lopDeduction = lopDays * perDay;
  const earned = Math.max(0, amount - lopDeduction);
  return {
    stipend: round(amount),
    perDay: round(perDay),
    workingDays,
    payableDays,
    lopDays: round(lopDays),
    lopDeduction: round(lopDeduction),
    actualGross: round(earned),
    tds: round(tds),
    netSalary: round(earned - tds),
  };
}

/** Month attendance totals with HR's payroll corrections (LOP, late LOP, payable days, TDS) applied. */
export function applyOverrides(summary, overrides) {
  const byField = Object.fromEntries(overrides.map((o) => [o.field, o]));
  const lop = byField.lop?.value ?? summary.lop;
  const lateLop = byField.lateLop?.value ?? summary.lateLop;
  const taskLop = byField.taskLop?.value ?? summary.taskLop ?? 0;
  const workingDays = summary.monthWorkingDays ?? summary.workingDays;
  const payableDays = byField.payableDays?.value ?? Math.max(0, workingDays - lop - lateLop - taskLop);
  return { ...summary, lop, lateLop, taskLop, workingDays, payableDays, tds: byField.tds?.value ?? 0 };
}

/** Salary or stipend for one employee-month, from attendance that already has overrides applied. */
export function payFor(employee, attendance, daysInMonth, settings) {
  const isStipend = ['Intern', 'Freelancer'].includes(employee.employeeType);
  const workingDays = attendance.monthWorkingDays ?? attendance.workingDays;
  const totalLop = attendance.lop + attendance.lateLop + (attendance.taskLop ?? 0);
  const pay = isStipend
    ? calculateStipend({ amount: employee.studentAmount, payableDays: attendance.payableDays, workingDays, daysInMonth, lopDays: totalLop, tds: attendance.tds })
    : calculateSalary({ ctc: employee.salaryAmount, payableDays: attendance.payableDays, workingDays, daysInMonth, lopDays: totalLop });
  return { isStipend, pay };
}
