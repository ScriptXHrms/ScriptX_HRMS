const round = (value) => Math.round(value * 100) / 100;

const PF_WAGE_CAP = 1800;
const EPS_CAP = 1250;
const ESI_GROSS_LIMIT = 21000;

/** Half-yearly Tamil Nadu professional tax slabs. */
function professionalTaxHalfYear(salary6Months) {
  if (salary6Months <= 21000) return 0;
  if (salary6Months <= 30000) return 180;
  if (salary6Months <= 45000) return 425;
  if (salary6Months <= 60000) return 930;
  if (salary6Months <= 75000) return 1025;
  return 1250;
}

/** Monthly gross from CTC, keeping employer PF and ESI inside the CTC. */
function grossFromCtc(ctc) {
  if (ctc / 1.0925 <= ESI_GROSS_LIMIT) return ctc / 1.0925;
  if ((ctc / 1.06) * 0.5 <= 15000) return ctc / 1.06;
  return ctc - PF_WAGE_CAP;
}

/** Salary breakdown for one employee-month. `ctc` is the monthly CTC. */
export function calculateSalary({ ctc, payableDays, daysInMonth, settings, tds = 0 }) {
  const dayRatio = daysInMonth ? payableDays / daysInMonth : 0;
  const gross = grossFromCtc(ctc);
  const basic = gross * (settings.basicPercent / 100) * dayRatio;
  const hra = basic * (settings.hraPercent / 100);
  const medical = settings.medicalAllowance * dayRatio;
  const conveyance = settings.conveyanceAllowance * dayRatio;
  const actualGross = gross * dayRatio;
  const other = Math.max(0, actualGross - (basic + hra + medical + conveyance));

  const employeePF = Math.min(basic * (settings.eePfPercent / 100), PF_WAGE_CAP);
  const employerEPS = Math.min(basic * 0.0833, EPS_CAP);
  const employerPF = Math.min(basic * (settings.erPfPercent / 100), PF_WAGE_CAP) - employerEPS;

  const esiApplies = gross <= ESI_GROSS_LIMIT;
  const employeeESI = esiApplies ? actualGross * (settings.eeEsiPercent / 100) : 0;
  const employerESI = esiApplies ? actualGross * (settings.erEsiPercent / 100) : 0;
  const professionalTax = professionalTaxHalfYear(gross * 6) / 6;
  const netSalary = actualGross - employeePF - employeeESI - professionalTax - tds;

  return Object.fromEntries(
    Object.entries({
      ctc,
      gross,
      actualGross,
      basic,
      hra,
      medical,
      conveyance,
      other,
      employeePF,
      employerPF,
      employerEPS,
      employeeESI,
      employerESI,
      professionalTax,
      tds,
      netSalary,
    }).map(([key, value]) => [key, round(value)]),
  );
}

/** Interns and freelancers get a flat stipend pro-rated by payable days, with no statutory deductions. */
export function calculateStipend({ amount, payableDays, daysInMonth, tds = 0 }) {
  const earned = daysInMonth ? amount * (payableDays / daysInMonth) : 0;
  return { stipend: round(amount), actualGross: round(earned), tds: round(tds), netSalary: round(earned - tds) };
}

/** Month attendance totals with HR's payroll corrections (LOP, late LOP, payable days, TDS) applied. */
export function applyOverrides(summary, overrides) {
  const byField = Object.fromEntries(overrides.map((o) => [o.field, o]));
  const lop = byField.lop?.value ?? summary.lop;
  const lateLop = byField.lateLop?.value ?? summary.lateLop;
  const payableDays = byField.payableDays?.value ?? Math.max(0, summary.eligibleDays - lop - lateLop);
  return { ...summary, lop, lateLop, payableDays, tds: byField.tds?.value ?? 0 };
}

/** Salary or stipend for one employee-month, from attendance that already has overrides applied. */
export function payFor(employee, attendance, daysInMonth, settings) {
  const isStipend = ['Intern', 'Freelancer'].includes(employee.employeeType);
  const pay = isStipend
    ? calculateStipend({ amount: employee.studentAmount, payableDays: attendance.payableDays, daysInMonth, tds: attendance.tds })
    : calculateSalary({ ctc: employee.salaryAmount, payableDays: attendance.payableDays, daysInMonth, settings, tds: attendance.tds });
  return { isStipend, pay };
}
