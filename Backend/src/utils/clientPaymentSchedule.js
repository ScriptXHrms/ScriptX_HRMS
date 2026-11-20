import { ClientPayment, Income } from '../models/index.js';
import { dayKey } from './dates.js';

export const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

export function getMonthNumber(monthStr) {
  if (!monthStr) return null;
  const lower = String(monthStr).trim().toLowerCase();
  const idx = MONTH_NAMES.findIndex((m) => m.startsWith(lower.slice(0, 3)));
  return idx >= 0 ? idx + 1 : null;
}

export function safeDateISO(year, month, day) {
  const maxDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const d = Math.min(Math.max(1, parseInt(day, 10) || 1), maxDays);
  return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function getCandidateDueDates(cp, todayStr) {
  const [currY, currM, currD] = todayStr.split('-').map(Number);
  const dates = [];
  const pt = cp.paymentType || 'One Time';

  const createdDate = cp.createdAt ? new Date(cp.createdAt) : new Date();
  const createdY = createdDate.getUTCFullYear();
  const createdM = createdDate.getUTCMonth() + 1;

  if (pt === 'One Time') {
    const m = getMonthNumber(cp.oneTimeMonth) || currM;
    const d = parseInt(cp.oneTimeDay, 10) || currD;
    dates.push(safeDateISO(currY, m, d));
  } else if (pt === 'Monthly') {
    const d = parseInt(cp.monthlyDay, 10) || 1;
    let startY = createdY;
    let startM = createdM;
    if (cp.project?.startDate) {
      const pY = parseInt(String(cp.project.startDate).slice(0, 4), 10);
      const pM = parseInt(String(cp.project.startDate).slice(5, 7), 10);
      if (pY && pM && (pY < startY || (pY === startY && pM < startM))) {
        startY = pY;
        startM = pM;
      }
    }
    let y = startY;
    let m = startM;
    while (y < currY || (y === currY && m <= currM)) {
      dates.push(safeDateISO(y, m, d));
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
    if (currM < 12) {
      dates.push(safeDateISO(currY, currM + 1, d));
    } else {
      dates.push(safeDateISO(currY + 1, 1, d));
    }
  } else if (pt === 'Quarterly' || pt === 'Quartly') {
    const pairs = [
      [cp.quarterlyMonth1, cp.quarterlyDay1],
      [cp.quarterlyMonth2, cp.quarterlyDay2],
      [cp.quarterlyMonth3, cp.quarterlyDay3],
      [cp.quarterlyMonth4, cp.quarterlyDay4],
    ];
    for (const [mStr, dStr] of pairs) {
      const m = getMonthNumber(mStr);
      if (m) dates.push(safeDateISO(currY, m, dStr || 1));
    }
  } else if (pt === 'Half Yearly') {
    const pairs = [
      [cp.halfYearlyMonth1, cp.halfYearlyDay1],
      [cp.halfYearlyMonth2, cp.halfYearlyDay2],
    ];
    for (const [mStr, dStr] of pairs) {
      const m = getMonthNumber(mStr);
      if (m) dates.push(safeDateISO(currY, m, dStr || 1));
    }
  } else if (pt === 'Yearly') {
    const y = parseInt(cp.yearlyYear, 10) || currY;
    const m = getMonthNumber(cp.yearlyMonth) || 1;
    const d = parseInt(cp.yearlyDay, 10) || 1;
    dates.push(safeDateISO(y, m, d));
  }

  return Array.from(new Set(dates));
}

export async function getScheduledClientPayments(query = {}, customToday = null) {
  const todayStr = customToday || dayKey();
  const [currY, currM, currD] = todayStr.split('-').map(Number);

  const clientPayments = await ClientPayment.find({
    status: { $ne: 'Completed' },
  })
    .populate('client', 'client_name company_name')
    .populate('project', 'name startDate')
    .lean();

  if (!clientPayments.length) return [];

  const confirmed = await Income.find(
    { clientPaymentRef: { $ne: null } },
    { clientPaymentRef: 1, installmentDate: 1, date: 1, month: 1, amount: 1 }
  ).lean();

  // Group confirmed income records by clientPaymentRef
  const confirmedByCP = new Map();
  for (const c of confirmed) {
    const cpId = String(c.clientPaymentRef);
    if (!confirmedByCP.has(cpId)) confirmedByCP.set(cpId, []);
    confirmedByCP.get(cpId).push(c);
  }

  const scheduled = [];

  for (const cp of clientPayments) {
    const cpId = String(cp._id);
    const budget = Number(cp.budget) || Number(cp.amount) || 0;
    const advance = Number(cp.advance) || 0;
    const paymentsList = cp.payments || [];
    const paymentsSum = paymentsList.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const cpIncomes = confirmedByCP.get(cpId) || [];
    const incomeSum = cpIncomes.reduce((s, c) => s + (Number(c.amount) || 0), 0);

    // Total received money across all payment records (avoiding double count between payments array & income docs)
    const paid = advance + Math.max(paymentsSum, incomeSum);
    const balance = budget - paid;
    if (balance <= 0) continue;

    // Build sets of explicitly paid keys (dates & months)
    const explicitlyPaidDates = new Set();
    const explicitlyPaidMonths = new Set();

    for (const c of cpIncomes) {
      if (c.installmentDate) {
        explicitlyPaidDates.add(c.installmentDate);
        explicitlyPaidMonths.add(c.installmentDate.slice(0, 7));
      }
      if (c.date) {
        explicitlyPaidDates.add(c.date);
        explicitlyPaidMonths.add(c.date.slice(0, 7));
      }
      if (c.month) {
        explicitlyPaidMonths.add(c.month);
      }
    }

    for (const p of paymentsList) {
      if (p.date) {
        explicitlyPaidDates.add(p.date);
        explicitlyPaidMonths.add(p.date.slice(0, 7));
      }
    }

    const candidateDates = getCandidateDueDates(cp, todayStr);
    // Sort in ascending chronological order (oldest first)
    candidateDates.sort((a, b) => a.localeCompare(b));

    let pType = cp.paymentType || 'One Time';
    if (pType === 'Quartly') pType = 'Quarterly';
    if (pType === 'Full Payment') pType = 'One Time';
    if (pType === 'Recurring') pType = 'Monthly';

    // Waterfall allocation of total paid funds (advance + payments)
    // Money already received covers earliest scheduled installments first
    let availablePaid = paid;

    for (const dueStr of candidateDates) {
      const dueMonth = dueStr.slice(0, 7);
      const regularInstallment = Math.min(Number(cp.amount) || balance, balance);
      if (regularInstallment <= 0) continue;

      // Check if this installment was explicitly paid
      const isExplicitlyPaid =
        explicitlyPaidDates.has(dueStr) ||
        (pType === 'Monthly' && explicitlyPaidMonths.has(dueMonth));

      if (isExplicitlyPaid) {
        availablePaid = Math.max(0, availablePaid - regularInstallment);
        continue; // Skip paid installment
      }

      // Check if covered by advance / general paid funds
      if (availablePaid >= regularInstallment) {
        availablePaid -= regularInstallment;
        continue; // Covered by advance/payment, skip!
      }

      // Unpaid portion of this installment
      let unpaidInstallmentAmount = regularInstallment;
      if (availablePaid > 0) {
        unpaidInstallmentAmount = Math.max(0, regularInstallment - availablePaid);
        availablePaid = 0;
      }

      if (unpaidInstallmentAmount <= 0) continue;

      const [dy, dm, dd] = dueStr.split('-').map(Number);
      const todayMs = Date.UTC(currY, currM - 1, currD);
      const dueMs = Date.UTC(dy, dm - 1, dd);
      const diffDays = Math.round((dueMs - todayMs) / (24 * 60 * 60 * 1000));

      if (diffDays > 3) continue;

      const isRed = diffDays < 0;

      if (query.month && !dueStr.startsWith(query.month)) continue;
      if (query.from && dueStr < query.from) continue;
      if (query.to && dueStr > query.to) continue;

      const clientName = cp.client?.company_name || cp.client?.client_name || 'Client';
      const projectName = cp.project?.name || '';

      scheduled.push({
        _id: `sched_${cp._id}_${dueStr}`,
        isScheduled: true,
        highlightColor: isRed ? 'red' : 'yellow',
        clientPaymentId: String(cp._id),
        installmentDate: dueStr,
        date: dueStr,
        month: dueMonth,
        account: null,
        amount: unpaidInstallmentAmount,
        budget,
        advance,
        received: paid,
        balance,
        source: clientName,
        clientName,
        projectName,
        paymentType: pType,
        rawPaymentType: cp.paymentType,
        scheduleSummary: cp.scheduleSummary || cp.paymentType,
        diffDays,
        paymentMode: isRed
          ? `Overdue (${Math.abs(diffDays)}d ago)`
          : diffDays === 0
          ? 'Due Today'
          : `Due in ${diffDays}d`,
        narration: `Client Payment - ${clientName}${projectName ? ` (${projectName})` : ''}`,
        description: `Scheduled: ${cp.scheduleSummary || cp.paymentType}`,
        notes: cp.notes || '',
        createdAt: `${dueStr}T00:00:00.000Z`,
      });
    }
  }

  return scheduled;
}
