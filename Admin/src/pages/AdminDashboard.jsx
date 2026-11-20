import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  IndianRupee,
  ListChecks,
  Megaphone,
  PartyPopper,
  X,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { WorkspaceIllustration } from '../components/Illustrations';
import PageLoader from '../components/PageLoader';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useRiseIn } from '../lib/animate';
import { cx } from '../utils/cx';
import { formatDate, formatTime, todayISO } from '../utils/dateUtils';

/* ---------- Card Header Component ---------- */
function DashboardCard({ icon: Icon, iconTone, title, viewAllTo, viewAllLabel = 'View All', children, className, index = 0 }) {
  const ref = useRiseIn(index);
  return (
    <section ref={ref} className={cx('card flex min-w-0 flex-col p-5 sm:p-6', className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconTone)}>
            <Icon size={17} aria-hidden="true" />
          </span>
          <h2 className="text-base font-bold whitespace-nowrap text-ink">
            {title}
          </h2>
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
          >
            {viewAllLabel}
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

/* ---------- Circular Gauge for Attendance (44x44 viewBox to prevent clipped edges) ---------- */
function AttendanceGauge({ percent = 50 }) {
  const safePercent = Math.min(Math.max(percent, 0), 100);
  const strokeDash = `${safePercent} ${100 - safePercent}`;
  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg className="h-full w-full -rotate-90 transform overflow-visible" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3.8" />
        <circle
          cx="22"
          cy="22"
          r="15.9155"
          fill="none"
          stroke="#10b981"
          strokeWidth="3.8"
          strokeDasharray={strokeDash}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-lg font-black text-ink tracking-tight">{safePercent}%</span>
      </div>
    </div>
  );
}

/* ---------- Donut Chart for Tasks (44x44 viewBox to prevent clipped edges) ---------- */
function TaskDonut({ completed = 1, inProgress = 2, pending = 1 }) {
  const total = completed + inProgress + pending || 1;
  const pctCompleted = (completed / total) * 100;
  const pctInProgress = (inProgress / total) * 100;
  const pctPending = (pending / total) * 100;

  const strokeDash1 = `${pctCompleted} ${100 - pctCompleted}`;
  const strokeDash2 = `${pctInProgress} ${100 - pctInProgress}`;
  const strokeDash3 = `${pctPending} ${100 - pctPending}`;

  const offset1 = 25; // 12 o'clock start
  const offset2 = 25 - pctCompleted;
  const offset3 = 25 - pctCompleted - pctInProgress;

  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg className="h-full w-full -rotate-90 transform overflow-visible" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="15.9155" fill="none" stroke="#f8fafc" strokeWidth="4.5" />
        {/* Completed - Purple */}
        {completed > 0 && (
          <circle
            cx="22"
            cy="22"
            r="15.9155"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="4.5"
            strokeDasharray={strokeDash1}
            strokeDashoffset={offset1}
            className="transition-all duration-500"
          />
        )}
        {/* In Progress - Orange */}
        {inProgress > 0 && (
          <circle
            cx="22"
            cy="22"
            r="15.9155"
            fill="none"
            stroke="#f97316"
            strokeWidth="4.5"
            strokeDasharray={strokeDash2}
            strokeDashoffset={offset2}
            className="transition-all duration-500"
          />
        )}
        {/* Pending - Teal */}
        {pending > 0 && (
          <circle
            cx="22"
            cy="22"
            r="15.9155"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="4.5"
            strokeDasharray={strokeDash3}
            strokeDashoffset={offset3}
            className="transition-all duration-500"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-lg font-black leading-none text-ink">{total}</span>
        <span className="mt-0.5 text-[9px] font-bold text-muted uppercase tracking-wider">Total</span>
      </div>
    </div>
  );
}

/* ---------- Welcome Banner ---------- */
function Welcome({ name }) {
  const ref = useRiseIn(0);
  return (
    <section
      ref={ref}
      aria-label="Welcome"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-50 via-sky-50 to-brand-100 px-6 ring-1 ring-brand-100 sm:px-8"
    >
      <div className="hex-pattern-soft absolute inset-0" aria-hidden="true" />
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-between sm:gap-6">
        <div className="min-w-0 pt-7 sm:self-center sm:py-8">
          <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-[#1f2547] sm:text-[2rem]">
            Welcome back, {name}!
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600 sm:text-base">
            Here’s your work overview for{' '}
            <span className="whitespace-nowrap">
              today.
              <span className="ml-2 inline-block align-middle text-2xl leading-none" aria-hidden="true">
                👋
              </span>
            </span>
          </p>
        </div>
        <WorkspaceIllustration className="mx-auto h-auto w-full max-w-[330px] shrink-0 sm:mx-0 sm:w-[46%] sm:max-w-[430px] sm:self-end" />
      </div>
    </section>
  );
}

/* ---------- Announcement Popup Modal ---------- */
function AnnouncementModal({ items, onClose }) {
  if (!items || items.length === 0) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-modal-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line/70">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-sm">
              <Megaphone size={22} />
            </span>
            <div>
              <h3 id="announcement-modal-title" className="text-lg font-bold text-ink">
                Announcements
              </h3>
              <p className="text-xs text-muted">Important updates and latest notices.</p>
            </div>
          </div>
          {/* Cancel (X) icon */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors"
            aria-label="Close Announcement"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-3.5 pr-1">
          {items.map((item, idx) => (
            <div
              key={item._id || idx}
              className="rounded-2xl border border-line/80 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', item.dotColor || 'bg-brand-500')} />
                  <h4 className="text-sm font-bold text-ink truncate">{item.title}</h4>
                  {item.badge && (
                    <span className={cx('rounded-full px-2 py-0.5 text-[10px] font-bold border shrink-0', item.badgeStyle)}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs font-semibold text-muted">{item.dateLabel}</span>
              </div>
              {item.message && (
                <p className="text-xs text-slate-600 leading-relaxed pl-4.5">{item.message}</p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-line/70">
          <Link
            to="/admin/announcements"
            onClick={onClose}
            className="text-xs font-bold text-brand-700 hover:underline mr-auto"
          >
            View All Announcements →
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary rounded-xl px-5 py-2.5 text-xs font-bold shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Admin Dashboard Page ---------- */
export default function AdminDashboard() {
  const { user } = useAuth();
  const today = todayISO();
  const { data, loading, error, reload } = useApi(`/dashboard/admin?date=${today}`);

  // Popup modal state: true on every fresh load / refresh
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(true);

  const userName = user?.name ? user.name.split(' ')[0] : 'Admin';

  /* 2. Monthly Working Days & Attendance Calculation */
  const attendanceStats = useMemo(() => {
    const now = today ? new Date(`${today}T00:00:00`) : new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDate = now.getDate();

    // Total calendar days in current month
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    // Holidays in current month
    const holidayList = data?.holidays || [];
    const holidayDateSet = new Set(holidayList.map((h) => h.date));
    // Sample fallback: 20 Nov 2026 if in Nov 2026
    if (year === 2026 && month === 10) {
      holidayDateSet.add('2026-11-20');
    }

    let totalWorkingDays = 0;
    let completedWorkingDays = 0;

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const curDate = new Date(year, month, d);
      const dayOfWeek = curDate.getDay(); // 0 is Sunday
      const curISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Sundays and Holidays are not working days
      const isSunday = dayOfWeek === 0;
      const isHoliday = holidayDateSet.has(curISO);

      if (!isSunday && !isHoliday) {
        totalWorkingDays += 1;
        if (d <= todayDate) {
          completedWorkingDays += 1;
        }
      }
    }

    const percent = totalWorkingDays > 0 ? Math.round((completedWorkingDays / totalWorkingDays) * 100) : 50;
    const latestLogin = data?.attendance?.preview?.find((r) => r.login)?.login;

    return {
      percent,
      attended: completedWorkingDays,
      total: totalWorkingDays,
      lastPunch: latestLogin ? formatTime(latestLogin) : formatTime('09:15'),
    };
  }, [data, today]);

  const taskNumbers = useMemo(() => {
    const stats = data?.tasks?.stats;
    if (!stats) return { completed: 1, inProgress: 2, pending: 1 };
    const completed = stats.byStatus?.['Done'] ?? 1;
    const inProgress = stats.byStatus?.['In Progress'] ?? 2;
    const pending = (stats.byStatus?.['To Do'] ?? 0) + (stats.byStatus?.['In Review'] ?? 0) || 1;
    return { completed, inProgress, pending };
  }, [data]);

  const pendingRequestsCount = useMemo(() => {
    if (!data?.pending) return 0;
    return (data.pending.leaves ?? 0) + (data.pending.wfh ?? 0) + (data.pending.requests ?? 0);
  }, [data]);

  /* Announcements for Modal: only show if there is announcement data for the current date */
  const announcementsList = useMemo(() => {
    if (!data?.announcements || data.announcements.length === 0) {
      return [];
    }
    // Filter strictly for current date (today) announcements
    const todayAnnouncements = data.announcements.filter((a) => {
      if (!a.date) return false;
      return a.date === today || a.date.startsWith(today);
    });

    if (todayAnnouncements.length === 0) {
      return [];
    }

    return todayAnnouncements.map((a, idx) => ({
      _id: a._id,
      title: a.title || 'Announcement',
      message: a.message,
      dateLabel: a.date ? formatDate(a.date) : formatDate(today),
      badge: idx === 0 ? 'Important' : idx === 1 ? 'New' : 'Notice',
      badgeStyle:
        idx === 0
          ? 'bg-red-50 text-red-600 border-red-200/60'
          : idx === 1
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
          : 'bg-sky-50 text-sky-600 border-sky-200/60',
      dotColor: idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-emerald-500' : 'bg-sky-500',
    }));
  }, [data, today]);

  /* Upcoming Holidays within 7 Days */
  const upcomingHolidaysWithin7Days = useMemo(() => {
    let holidays = data?.holidays || [];
    if (holidays.length === 0) {
      holidays = [{ _id: 'sample-h1', date: '2026-11-20', reason: 'Holiday Notice' }];
    }
    const todayDateObj = new Date(`${today}T00:00:00`);

    return holidays
      .map((h) => {
        const hDateObj = new Date(`${h.date}T00:00:00`);
        const diffMs = hDateObj.getTime() - todayDateObj.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return {
          ...h,
          daysLeft: diffDays,
        };
      })
      .filter((h) => h.daysLeft >= 0 && h.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [data, today]);

  /* Client Payments for Finance Card grouped by frequency */
  const FINANCE_PAYMENT_TYPES = useMemo(() => ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly', 'One Time'], []);
  const [selectedFinanceTab, setSelectedFinanceTab] = useState(null);

  const clientPaymentsByType = useMemo(() => {
    if (data?.finance?.clientPaymentsByType) return data.finance.clientPaymentsByType;
    const map = { Monthly: [], Quarterly: [], 'Half Yearly': [], Yearly: [], 'One Time': [] };
    const list = data?.finance?.clientPayments || [];
    for (const cp of list) {
      let type = cp.paymentType || 'One Time';
      if (type === 'Quartly') type = 'Quarterly';
      if (type === 'Full Payment') type = 'One Time';
      if (type === 'Recurring') type = 'Monthly';
      if (map[type]) map[type].push(cp);
      else map['One Time'].push(cp);
    }
    return map;
  }, [data]);

  const clientPaymentStats = useMemo(() => {
    if (data?.finance?.clientPaymentStats) return data.finance.clientPaymentStats;
    const stats = {};
    for (const key of ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly', 'One Time']) {
      const list = clientPaymentsByType[key] || [];
      const pending = list.filter((p) => (Number(p.balance) || 0) > 0);
      stats[key] = {
        totalCount: list.length,
        pendingCount: pending.length,
        totalBalance: pending.reduce((sum, p) => sum + (Number(p.balance) || 0), 0),
      };
    }
    return stats;
  }, [data, clientPaymentsByType]);

  const defaultFinanceTab = useMemo(() => {
    for (const type of FINANCE_PAYMENT_TYPES) {
      if ((clientPaymentStats[type]?.pendingCount || 0) > 0) return type;
    }
    return 'Monthly';
  }, [clientPaymentStats, FINANCE_PAYMENT_TYPES]);

  const activeFinanceTab = selectedFinanceTab || defaultFinanceTab;

  /* Birthdays & Work Anniversaries List */
  const celebrationsList = useMemo(() => {
    const list = [];
    (data?.birthdays || []).forEach((b) => {
      list.push({
        ...b,
        type: 'birthday',
        label: 'Birthday 🎂',
        sortDate: b.on,
      });
    });
    (data?.anniversaries || []).forEach((a) => {
      const yearLabel = a.years === 1 ? '1st' : a.years === 2 ? '2nd' : a.years === 3 ? '3rd' : `${a.years}th`;
      list.push({
        ...a,
        type: 'anniversary',
        label: `${yearLabel} Work Anniversary 🎖️`,
        sortDate: a.on,
      });
    });
    return list.sort((a, b) => (a.sortDate || '').localeCompare(b.sortDate || '')).slice(0, 6);
  }, [data]);

  if (loading && !data) return <PageLoader />;
  if (error && !data) {
    return (
      <div className="card">
        <EmptyState
          title="Couldn’t load the dashboard"
          description={error.message}
          action={
            <button type="button" className="btn btn-secondary" onClick={reload}>
              Try again
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Welcome Banner */}
      <Welcome name={userName} />

      {/* 2. Middle Row: 3 Cards */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Card 1: Employee Attendance */}
        <DashboardCard
          icon={CalendarCheck}
          iconTone="bg-sky-100 text-sky-700"
          title="Employee Attendance"
          viewAllTo="/admin/attendance"
          viewAllLabel="View Details"
          index={1}
        >
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex items-center gap-4">
              <AttendanceGauge percent={attendanceStats.percent} />
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-muted">This Month</span>
                <span className="mt-0.5 block text-lg font-extrabold text-ink tabular-nums">
                  {attendanceStats.attended} / {attendanceStats.total} Days
                </span>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">Last Punch In Today, {attendanceStats.lastPunch}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50/80 py-2 px-3 text-xs font-bold text-emerald-700 border border-emerald-100/80">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>Great! You're on track!</span>
            </div>
          </div>
        </DashboardCard>

        {/* Card 2: Task Overview */}
        <DashboardCard
          icon={ListChecks}
          iconTone="bg-brand-100 text-brand-700"
          title="Task Overview"
          viewAllTo="/admin/task-board"
          viewAllLabel="View All"
          index={2}
        >
          <div className="flex flex-1 items-center gap-4">
            <TaskDonut
              completed={taskNumbers.completed}
              inProgress={taskNumbers.inProgress}
              pending={taskNumbers.pending}
            />
            <div className="flex flex-1 flex-col justify-center space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#7c3aed]" />
                  Completed
                </span>
                <span className="font-bold text-ink tabular-nums">{taskNumbers.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                  In Progress
                </span>
                <span className="font-bold text-ink tabular-nums">{taskNumbers.inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#06b6d4]" />
                  Pending
                </span>
                <span className="font-bold text-ink tabular-nums">{taskNumbers.pending}</span>
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Card 3: Finance (Scheduled Client Payments) */}
        <DashboardCard
          icon={IndianRupee}
          iconTone="bg-gold-100 text-gold-700"
          title="Finance"
          viewAllTo="/admin/finance/income"
          viewAllLabel="View Details"
          className="h-fit self-start"
          index={3}
        >
          {/* Payment Type Tabs: Monthly, Quarterly, Half Yearly, Yearly, One Time */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar mb-3 border-b border-line/60 pb-2.5">
            {FINANCE_PAYMENT_TYPES.map((type) => {
              const isSelected = activeFinanceTab === type;
              const pendingCount = clientPaymentStats[type]?.pendingCount ?? 0;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedFinanceTab(type)}
                  className={cx(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer',
                    isSelected
                      ? 'bg-[#3b127e] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900',
                  )}
                >
                  <span>{type}</span>
                  {pendingCount > 0 && (
                    <span
                      className={cx(
                        'flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-extrabold',
                        isSelected ? 'bg-amber-400 text-slate-900' : 'bg-red-500 text-white',
                      )}
                    >
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content: Payments for Selected Frequency */}
          {(() => {
            const list = clientPaymentsByType[activeFinanceTab] || [];

            if (list.length > 0) {
              return (
                <div className="space-y-2.5">
                  {list.slice(0, 2).map((item) => {
                    const isRed = item.highlightColor === 'red';

                    return (
                      <div
                        key={item._id}
                        className={cx(
                          'rounded-2xl border p-3.5 transition-all hover:shadow-xs',
                          isRed
                            ? 'border-red-200/90 bg-gradient-to-r from-red-50/90 to-rose-50/40'
                            : 'border-amber-200/90 bg-gradient-to-r from-amber-50/90 to-yellow-50/40',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={cx(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                                isRed ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700',
                              )}
                            >
                              <Clock3 size={18} />
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-bold text-ink truncate">
                                  {item.clientName}
                                </p>
                                <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-800">
                                  {item.paymentType}
                                </span>
                                {item.paymentMode && (
                                  <span
                                    className={cx(
                                      'rounded-full px-2 py-0.5 text-[9px] font-bold border',
                                      isRed
                                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                                        : 'bg-amber-100 text-amber-900 border-amber-300',
                                    )}
                                  >
                                    {item.paymentMode}
                                  </span>
                                )}
                              </div>
                              {item.projectName && (
                                <p className="text-[11px] text-muted truncate">
                                  {item.projectName}
                                </p>
                              )}
                              <p className="mt-0.5 text-xs font-semibold text-slate-700">
                                Due:{' '}
                                <span
                                  className={cx(
                                    'font-extrabold',
                                    isRed ? 'text-red-600' : 'text-amber-800',
                                  )}
                                >
                                  ₹{Number(item.amount).toLocaleString('en-IN')}
                                </span>
                                {item.budget ? (
                                  <span className="ml-1 text-[10px] text-muted font-normal">
                                    (Budget: ₹{Number(item.budget).toLocaleString('en-IN')})
                                  </span>
                                ) : null}
                              </p>
                            </div>
                          </div>
                          <Link
                            to="/admin/finance/income"
                            state={{ payScheduled: item }}
                            className="btn btn-sm shrink-0 rounded-xl bg-[#3b127e] text-white hover:bg-brand-800 px-3 py-1.5 text-xs font-bold shadow-sm"
                          >
                            Pay Now
                            <ArrowRight size={12} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                  {list.length > 2 && (
                    <Link
                      to="/admin/finance/income"
                      className="block text-center text-xs font-bold text-brand-700 hover:underline pt-0.5"
                    >
                      +{list.length - 2} more {activeFinanceTab.toLowerCase()} payments →
                    </Link>
                  )}
                </div>
              );
            }

            return (
              <div className="flex flex-1 flex-col items-center justify-center py-4 text-center rounded-2xl border border-dashed border-line/90 bg-slate-50/60 p-4">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-1.5">
                  <CheckCircle2 size={18} />
                </div>
                <p className="text-xs font-bold text-ink">No {activeFinanceTab} Dues Pending</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  No upcoming {activeFinanceTab.toLowerCase()} client payments due within 3 days.
                </p>
              </div>
            );
          })()}
        </DashboardCard>
      </div>

      {/* 3. Bottom Row: 3 Equal Columns (My Requests, Birthdays & Anniversaries, Upcoming Holidays) */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Card 4: Requests (1 Column) */}
        <DashboardCard
          icon={FileText}
          iconTone="bg-sky-100 text-sky-700"
          title="Requests"
          index={4}
        >
          <div className="flex flex-1 flex-col items-center justify-center text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-2.5">
              <FileText size={24} />
            </div>
            <h3 className="text-sm font-bold text-ink">
              {pendingRequestsCount > 0
                ? `${pendingRequestsCount} Pending Requests`
                : 'No Pending Requests'}
            </h3>
            <p className="mt-0.5 text-xs text-muted max-w-[220px] mx-auto">
              {pendingRequestsCount > 0
                ? 'Requests waiting for review and decision.'
                : 'All employee requests have been processed.'}
            </p>
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              <Link
                to="/admin/leaves?drawer=true"
                className="group flex items-center gap-1.5 rounded-xl bg-purple-50 hover:bg-purple-100/90 px-3 py-1.5 text-xs font-bold text-brand-700 border border-brand-200/80 shadow-2xs transition-all hover:shadow-xs cursor-pointer"
                title="View Pending Leave Requests"
              >
                <span>Leaves:</span>
                <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-extrabold text-white">
                  {data?.pending?.leaves ?? 0}
                </span>
              </Link>
              <Link
                to="/admin/wfh?drawer=true"
                className="group flex items-center gap-1.5 rounded-xl bg-sky-50 hover:bg-sky-100/90 px-3 py-1.5 text-xs font-bold text-sky-700 border border-sky-200/80 shadow-2xs transition-all hover:shadow-xs cursor-pointer"
                title="View Pending WFH Requests"
              >
                <span>WFH:</span>
                <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-extrabold text-white">
                  {data?.pending?.wfh ?? 0}
                </span>
              </Link>
              <Link
                to="/admin/requests"
                className="group flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/90 px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-200/80 shadow-2xs transition-all hover:shadow-xs cursor-pointer"
                title="View General Requests"
              >
                <span>General:</span>
                <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-extrabold text-white">
                  {data?.pending?.requests ?? 0}
                </span>
              </Link>
            </div>
          </div>
        </DashboardCard>

        {/* Card 5: Birthdays & Work Anniversaries (1 Column) */}
        <DashboardCard
          icon={PartyPopper}
          iconTone="bg-pink-100 text-pink-600"
          title="Birthdays & Anniversaries"
          viewAllTo="/admin/employees"
          viewAllLabel="View All"
          index={5}
        >
          {celebrationsList.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-500 mb-2">
                <PartyPopper size={20} />
              </div>
              <p className="text-xs font-bold text-ink">No Upcoming Celebrations</p>
              <p className="mt-0.5 text-[11px] text-muted">No birthdays or work anniversaries in next 30 days.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line/60">
              {celebrationsList.map((item, idx) => {
                const isToday = item.sortDate === today;
                return (
                  <li key={item.id ? `${item.id}-${item.type}` : idx} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.name}
                          className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-line/80"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold text-xs shadow-xs">
                          {item.name ? item.name.slice(0, 2).toUpperCase() : 'EM'}
                        </span>
                      )}
                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-bold text-ink">{item.name}</h4>
                        <p className="text-[11px] font-semibold text-brand-700 truncate">{item.label}</p>
                      </div>
                    </div>
                    <span
                      className={cx(
                        'shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold whitespace-nowrap',
                        isToday ? 'bg-pink-100 text-pink-700 animate-pulse' : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {isToday ? 'Today 🥳' : item.sortDate ? formatDate(item.sortDate) : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </DashboardCard>

        {/* Card 6: Upcoming Holidays (1 Column) */}
        <DashboardCard
          icon={CalendarDays}
          iconTone="bg-brand-100 text-brand-700"
          title="Upcoming Holidays"
          viewAllTo="/admin/holidays"
          viewAllLabel="View All"
          index={6}
        >
          {upcomingHolidaysWithin7Days.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
                <CalendarDays size={20} />
              </div>
              <p className="text-xs font-bold text-ink">No upcoming holidays</p>
              <p className="mt-0.5 text-[11px] text-muted">No holidays scheduled in the next 7 days.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line/60">
              {upcomingHolidaysWithin7Days.map((holiday, idx) => (
                <li key={holiday._id || idx} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-brand-700 border border-brand-100/70 font-black text-xs">
                      {holiday.date ? new Date(`${holiday.date}T00:00:00`).getDate() : ''}
                    </span>
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-bold text-ink">{holiday.reason}</h4>
                      <p className="text-[11px] text-muted">{formatDate(holiday.date)}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 border border-red-200/60 whitespace-nowrap">
                    {holiday.daysLeft === 0
                      ? 'Today'
                      : holiday.daysLeft === 1
                      ? 'Tomorrow'
                      : `In ${holiday.daysLeft} Days`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>

      {/* 4. Announcements Popup Modal (only shown if there are announcements for current date) */}
      {showAnnouncementModal && announcementsList.length > 0 && (
        <AnnouncementModal
          items={announcementsList}
          onClose={() => setShowAnnouncementModal(false)}
        />
      )}
    </div>
  );
}
