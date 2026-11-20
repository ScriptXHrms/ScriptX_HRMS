import {
  Announcement, Attendance, ClientPayment, Employee, EmployeeRequest, getSettings, Holiday, Invoice, Leave, RecurringPayment, Task, TASK_STATUSES,
} from '../models/index.js';
import { buildMonthDays, classifyDay, loadRange, monthRange, summarizeEntries, summarizeMonth } from '../utils/attendance.js';
import { dayKey, eachDay, isDayKey, isSunday, shiftDay } from '../utils/dates.js';
import { getScheduledClientPayments } from '../utils/clientPaymentSchedule.js';

const EXCEPTION_ORDER = { Absent: 0, 'On Leave': 1, 'Half Day': 2, 'Work From Home': 3, 'On Duty': 4, Present: 5, Holiday: 6, 'Weekly Off': 7 };
const TASK_POPULATE = [
  { path: 'project', select: 'name client', populate: { path: 'client', select: 'client_name company_name' } },
  { path: 'assignedTo', select: 'name employeeId photo' },
];
const LEAVE_POPULATE = { path: 'employee', select: 'name employeeId photo' };

function taskStats(tasks, today) {
  const open = tasks.filter((t) => t.status !== 'Done');
  const count = (list, key) => list.reduce((acc, t) => ({ ...acc, [t[key]]: (acc[t[key]] ?? 0) + 1 }), {});
  const soon = shiftDay(today, 7);
  return {
    total: tasks.length,
    open: open.length,
    overdue: open.filter((t) => t.dueDate && t.dueDate < today).length,
    dueSoon: open.filter((t) => t.dueDate && t.dueDate >= today && t.dueDate <= soon).length,
    byStatus: count(tasks, 'status'),
    byPriority: count(open, 'priority'),
  };
}

function extractMonthDayYear(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const s = dateStr.trim();
  // Format: YYYY-MM-DD or YYYY/MM/DD
  let match = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = String(parseInt(match[2], 10)).padStart(2, '0');
    const d = String(parseInt(match[3], 10)).padStart(2, '0');
    return { year: y, month: m, day: d, monthDay: `${m}-${d}` };
  }
  // Format: DD-MM-YYYY or DD/MM/YYYY
  match = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (match) {
    const d = String(parseInt(match[1], 10)).padStart(2, '0');
    const m = String(parseInt(match[2], 10)).padStart(2, '0');
    const y = parseInt(match[3], 10);
    return { year: y, month: m, day: d, monthDay: `${m}-${d}` };
  }
  return null;
}

async function birthdaysFrom(today) {
  const window = Array.from({ length: 30 }, (_, i) => shiftDay(today, i));
  const employees = await Employee.find({
    status: { $ne: 'Relieved' },
    dateOfBirth: { $exists: true, $ne: '' },
  })
    .select('name employeeId dateOfBirth photo')
    .lean();

  return employees
    .map((e) => {
      const parsed = extractMonthDayYear(e.dateOfBirth);
      if (!parsed) return null;
      const on = window.find((day) => day.slice(5) === parsed.monthDay);
      return on
        ? {
            id: e._id,
            name: e.name,
            employeeId: e.employeeId,
            photo: e.photo,
            on,
          }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.on.localeCompare(b.on))
    .slice(0, 6);
}

async function anniversariesFrom(today) {
  const window = Array.from({ length: 30 }, (_, i) => shiftDay(today, i));
  const employees = await Employee.find({
    status: { $ne: 'Relieved' },
    dateOfJoining: { $exists: true, $ne: '' },
  })
    .select('name employeeId dateOfJoining photo')
    .lean();

  return employees
    .map((e) => {
      const parsed = extractMonthDayYear(e.dateOfJoining);
      if (!parsed) return null;

      const on = window.find((day) => day.slice(5) === parsed.monthDay);
      if (!on) return null;

      const onYear = Number(on.slice(0, 4));
      const years = onYear - parsed.year;
      if (years < 1) return null;

      return {
        id: e._id,
        name: e.name,
        employeeId: e.employeeId,
        photo: e.photo,
        on,
        years,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.on.localeCompare(b.on))
    .slice(0, 6);
}

export async function getAdminDashboard(req, res) {
  const today = dayKey();
  const date = isDayKey(req.query.date) ? req.query.date : today;

  const employees = await Employee.find({ status: { $ne: 'Relieved' } })
    .select('name employeeId shift dateOfJoining department role photo')
    .populate('department', 'name')
    .populate('shift', 'name from to')
    .sort({ name: 1 })
    .lean();
  const ctx = await loadRange(employees.map((e) => e._id), date, date);

  const rows = employees
    .map((employee) => {
      const record = ctx.recordFor(employee._id, date);
      const day = classifyDay({ date, today, joinDate: employee.dateOfJoining, record, leaves: ctx.leavesFor(employee._id), holidayReason: ctx.holidays.get(date), paidCodes: ctx.paidCodes });
      const summary = record ? summarizeEntries(record) : null;
      return {
        employee,
        status: day.status,
        isLate: record?.isLate ?? false,
        lateMinutes: record?.lateMinutes ?? 0,
        login: summary?.login ?? null,
        logout: summary?.logout ?? null,
        payableMinutes: summary?.payableMinutes ?? 0,
        leaveType: day.leave?.leaveType,
      };
    })
    .filter((row) => row.status !== 'Not Joined');

  const summary = rows.reduce((acc, row) => ({ ...acc, [row.status]: (acc[row.status] ?? 0) + 1 }), { total: rows.length });
  summary.late = rows.filter((r) => r.isLate).length;

  const [tasks, pendingLeaves, pendingWfh, pendingRequests, dayLeaves, holidays, announcements, recurring, invoices, clientPaymentsDocs, birthdays, anniversaries] = await Promise.all([
    Task.find().populate(TASK_POPULATE).lean(),
    Leave.countDocuments({ status: 'Pending', category: { $in: ['Leave', 'Permission'] } }),
    Leave.countDocuments({ status: 'Pending', category: 'WFH' }),
    EmployeeRequest.countDocuments({ status: 'Pending' }),
    Leave.find({ startDate: { $lte: date }, endDate: { $gte: date }, status: { $in: ['Approved', 'Pending'] } }).populate(LEAVE_POPULATE).lean(),
    Holiday.find({ date: { $gte: today } }).sort({ date: 1 }).limit(5).lean(),
    Announcement.find({ status: 'Active', date: { $lte: today }, expiryDate: { $gte: today }, visible: { $ne: 'Employees' } }).sort({ date: -1 }).limit(5).lean(),
    RecurringPayment.find({ status: { $ne: 'Completed' } }).select('name lenderName paymentType amount emiAmount dueDay logs').lean(),
    Invoice.find({ status: { $ne: 'Paid' } }).select('invoiceNumber client dueDate totalAmount receivedAmount').lean(),
    ClientPayment.find()
      .populate('client', 'client_name company_name')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .lean(),
    birthdaysFrom(today),
    anniversariesFrom(today),
  ]);

  const month = today.slice(0, 7);
  const unpaidRecurringList = recurring
    .filter((r) => !r.logs.some((l) => l.date.startsWith(month)))
    .map((r) => {
      const dueDay = r.dueDay || 1;
      const dueDate = `${today.slice(0, 7)}-${String(dueDay).padStart(2, '0')}`;
      return {
        _id: r._id,
        type: 'recurring',
        name: r.name || r.lenderName || 'Recurring Payment',
        amount: r.emiAmount || r.amount || 0,
        dueDate,
      };
    });

  // Client Payments: get scheduled installments due within 3 days or overdue (matching Income page logic)
  const scheduledClientPayments = await getScheduledClientPayments({}, today);

  const clientPaymentsByType = {
    'Monthly': [],
    'Quarterly': [],
    'Half Yearly': [],
    'Yearly': [],
    'One Time': [],
  };

  for (const item of scheduledClientPayments) {
    let pType = item.paymentType || 'One Time';
    if (pType === 'Quartly') pType = 'Quarterly';
    if (pType === 'Full Payment') pType = 'One Time';
    if (pType === 'Recurring') pType = 'Monthly';

    if (clientPaymentsByType[pType]) {
      clientPaymentsByType[pType].push(item);
    } else {
      clientPaymentsByType['One Time'].push(item);
    }
  }

  const clientPaymentStats = {};
  for (const key of ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly', 'One Time']) {
    const list = clientPaymentsByType[key] || [];
    clientPaymentStats[key] = {
      totalCount: list.length,
      pendingCount: list.length,
      totalBudget: list.reduce((s, cp) => s + (Number(cp.budget) || 0), 0),
      totalReceived: list.reduce((s, cp) => s + (Number(cp.received) || 0), 0),
      totalBalance: list.reduce((s, cp) => s + (Number(cp.balance) || 0), 0),
      totalDueAmount: list.reduce((s, cp) => s + (Number(cp.amount) || 0), 0),
    };
  }

  const nextDueItem = scheduledClientPayments[0] || null;
  const nextDue = nextDueItem
    ? {
        _id: nextDueItem._id,
        type: 'client_payment',
        paymentType: nextDueItem.paymentType,
        name: `${nextDueItem.clientName}${nextDueItem.projectName ? ` • ${nextDueItem.projectName}` : ''}`,
        amount: nextDueItem.amount,
        budget: nextDueItem.budget,
        received: nextDueItem.received,
        balance: nextDueItem.balance,
        status: nextDueItem.paymentMode,
        dueDate: nextDueItem.date || today,
        highlightColor: nextDueItem.highlightColor,
      }
    : null;

  const unpaidRecurring = unpaidRecurringList.reduce((total, r) => total + r.amount, 0);

  const sortedByDue = [...tasks].filter((t) => t.status !== 'Done' && t.dueDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const soon = shiftDay(today, 7);

  res.json({
    date,
    today,
    attendance: {
      summary,
      preview: [...rows].sort((a, b) => (EXCEPTION_ORDER[a.status] ?? 9) - (EXCEPTION_ORDER[b.status] ?? 9)).slice(0, 7),
      lateLogins: rows.filter((r) => r.isLate).sort((a, b) => b.lateMinutes - a.lateMinutes).slice(0, 8),
    },
    tasks: {
      stats: taskStats(tasks, today),
      statuses: TASK_STATUSES,
      upcoming: sortedByDue.filter((t) => t.dueDate >= today && t.dueDate <= soon).slice(0, 6),
      overdue: sortedByDue.filter((t) => t.dueDate < today).slice(0, 12),
      recent: [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    },
    pending: { leaves: pendingLeaves, wfh: pendingWfh, requests: pendingRequests },
    today_people: {
      leave: dayLeaves.filter((l) => l.category === 'Leave'),
      permission: dayLeaves.filter((l) => l.category === 'Permission'),
      wfh: dayLeaves.filter((l) => l.category === 'WFH'),
    },
    holidays,
    announcements,
    birthdays,
    anniversaries,
    finance: req.auth.modules.finance
      ? {
          unpaidRecurring,
          receivables: scheduledClientPayments.reduce((total, cp) => total + (Number(cp.balance) || 0), 0),
          nextDue,
          clientPayments: scheduledClientPayments,
          clientPaymentsByType,
          clientPaymentStats,
          upcomingDues: scheduledClientPayments.map((cp) => ({
            _id: cp._id,
            type: 'client_payment',
            paymentType: cp.paymentType,
            name: `${cp.clientName}${cp.projectName ? ` • ${cp.projectName}` : ''}`,
            amount: cp.amount,
            budget: cp.budget,
            received: cp.received,
            balance: cp.balance,
            status: cp.paymentMode,
            dueDate: cp.date || today,
            highlightColor: cp.highlightColor,
          })),
        }
      : null,
  });
}

export async function getEmployeeDashboard(req, res) {
  const today = dayKey();
  const employeeId = req.auth.employeeId;
  const [tasks, leaves, holidays, announcements, birthdays, anniversaries, settings, requests, teamToday] = await Promise.all([
    Task.find({ assignedTo: employeeId }).populate(TASK_POPULATE).lean(),
    Leave.find({ employee: employeeId, startDate: { $gte: `${today.slice(0, 4)}-01-01` } }).lean(),
    Holiday.find({ date: { $gte: today } }).sort({ date: 1 }).limit(5).lean(),
    Announcement.find({ status: 'Active', date: { $lte: today }, expiryDate: { $gte: today }, visible: { $ne: 'Admins' } }).sort({ date: -1 }).limit(5).lean(),
    birthdaysFrom(today),
    anniversariesFrom(today),
    getSettings(),
    EmployeeRequest.countDocuments({ employee: employeeId, status: 'Pending' }),
    Attendance.find({ date: today, isLate: false }).select('employee entries date').populate('employee', 'name employeeId').lean(),
  ]);

  const employee = await Employee.findById(employeeId).select('name employeeId dateOfJoining').lean();
  const [year, month] = today.split('-').map(Number);
  const range = monthRange(year, month);
  const ctx = await loadRange([employeeId], range.start, range.end);
  const days = buildMonthDays(employee || { _id: employeeId }, range, ctx);
  const monthSummary = summarizeMonth(days, settings);
  const workingDaysInMonth = days.filter((d) => d.status !== 'Weekly Off' && d.status !== 'Holiday').length;
  const monthData = {
    ...monthSummary,
    workingDaysInMonth: workingDaysInMonth || Math.max(1, range.daysInMonth - (monthSummary.weeklyOffs + monthSummary.holidays)),
  };
  const leaveData = {
    thisMonth: monthSummary.leave || 0,
    taken: monthSummary.leave || 0,
  };
  const focusTasks = tasks.filter((t) => t.status !== 'Done');

  const team = teamToday.map((r) => ({
    id: r.employee?._id,
    name: r.employee?.name,
    employeeId: r.employee?.employeeId,
    login: r.entries?.[0]?.time,
  }));

  res.json({
    today,
    month: monthData,
    leave: leaveData,
    tasks: {
      stats: taskStats(tasks, today),
      open: focusTasks.slice(0, 5),
      focus: focusTasks.slice(0, 5),
    },
    attendance: {
      monthSummary: monthData,
      team,
    },
    leaves,
    holidays,
    announcements,
    birthdays,
    anniversaries,
    pendingRequests: requests,
  });
}
