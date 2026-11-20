import { Fragment, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CircleCheckBig,
  ClipboardList,
  Clock3,
  Coffee,
  ListChecks,
  LogOut,
  Megaphone,
  PartyPopper,
  Plane,
  SquareCheckBig,
  X,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { HolidayArt, TrophyIllustration, WorkspaceIllustration } from '../components/Illustrations';
import PageLoader from '../components/PageLoader';
import { useAuth } from '../context/AuthContext';
import { isOverdue } from '../features/tasks/taskUtils';
import { useApi } from '../hooks/useApi';
import { useTodayAttendance } from '../hooks/useTodayAttendance';
import { useRiseIn } from '../lib/animate';
import { cx } from '../utils/cx';
import { daysFromToday, formatDate, formatDuration, formatTime, todayISO } from '../utils/dateUtils';

const PRIORITY_CHIPS = {
  Urgent: 'bg-red-100 text-red-700',
  High: 'bg-red-50 text-red-600',
  Medium: 'bg-orange-50 text-orange-600',
  Low: 'bg-sky-50 text-sky-700',
};

/* ---------- building blocks ---------- */

function Panel({ title, icon: Icon, iconTone = 'bg-sky-100 text-sky-700', action, index = 0, className, children }) {
  const ref = useRiseIn(index);
  const id = useId();
  return (
    <section ref={ref} aria-labelledby={id} className={cx('card flex min-w-0 flex-col p-5 sm:p-6', className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconTone)}>
            <Icon size={17} aria-hidden="true" />
          </span>
          <h2 id={id} className="text-base font-bold whitespace-nowrap text-ink">
            {title}
          </h2>
        </div>
        {action && <div className="ml-auto shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  );
}

function ViewAll({ to, children = 'View All' }) {
  return (
    <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
      {children}
      <ArrowRight size={13} aria-hidden="true" />
    </Link>
  );
}

/** Several counts in one card, each value straight under its own label, split by slashes. */
function StatParts({ parts }) {
  return (
    <span className="grid w-fit grid-flow-col grid-rows-[auto_auto] gap-x-1 text-center">
      {parts.map((part, i) => (
        <Fragment key={part.label}>
          {i > 0 && (
            <>
              <span className="text-sm text-muted" aria-hidden="true">
                /
              </span>
              <span className="mt-0.5 text-2xl font-bold text-slate-300" aria-hidden="true">
                /
              </span>
            </>
          )}
          <span className="text-sm font-semibold whitespace-nowrap text-ink">{part.label}</span>
          <span className="mt-0.5 text-2xl font-extrabold tracking-tight text-ink tabular-nums">{part.value}</span>
        </Fragment>
      ))}
    </span>
  );
}

function StatCard({ icon: Icon, tone, label, value, unit, parts, note, to, index }) {
  const ref = useRiseIn(index);
  return (
    <Link ref={ref} to={to} className="card @container block min-w-0 p-4 transition-all hover:-translate-y-0.5 hover:shadow-pop sm:p-5">
      <span className="flex items-center gap-3.5 @max-[238px]:flex-col @max-[238px]:items-start @max-[238px]:gap-3">
        <span className={cx('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', tone)}>
          <Icon size={24} aria-hidden="true" />
        </span>
        <span className="min-w-0 @max-[238px]:w-full">
          {parts ? (
            <StatParts parts={parts} />
          ) : (
            <>
              <span className="block truncate text-sm font-semibold text-ink">{label}</span>
              <span className="mt-0.5 block text-2xl font-extrabold tracking-tight text-ink tabular-nums">
                {value}
                {unit && <span className="text-lg font-bold"> {unit}</span>}
              </span>
            </>
          )}
          <span className="block truncate text-xs text-muted">{note}</span>
        </span>
      </span>
    </Link>
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

const STATES = {
  'not-started': { icon: Clock3, tone: 'bg-slate-100 text-slate-500', title: 'Not Logged In' },
  working: { icon: CircleCheckBig, tone: 'bg-green-500 text-white shadow-lg shadow-green-500/30', title: 'Logged In' },
  'on-break': { icon: Coffee, tone: 'bg-gold-400 text-brand-900 shadow-lg shadow-gold-400/30', title: 'On Break' },
  finished: { icon: LogOut, tone: 'bg-brand-700 text-white shadow-lg shadow-brand-700/30', title: 'Logged Out' },
};

function TodayAttendance({ index }) {
  const { record, shift, state, workedMs, checkInNote } = useTodayAttendance();
  const view = STATES[state] ?? STATES['not-started'];
  const Icon = view.icon;
  const time = state === 'finished' ? record?.logout : record?.login;
  return (
    <Panel
      title="Today’s Attendance"
      icon={CalendarDays}
      index={index}
      action={<span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700 ring-1 ring-green-200">Today • {formatDate(new Date())}</span>}
    >
      <div className="flex flex-1 flex-col rounded-2xl bg-gradient-to-b from-green-50/70 to-white p-4 ring-1 ring-line/70">
        <div className="flex items-center justify-center gap-4 py-3">
          <span className={cx('flex h-16 w-16 shrink-0 items-center justify-center rounded-full', view.tone)}>
            <Icon size={32} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-extrabold text-ink">{view.title}</p>
            <p className="text-base font-semibold text-ink tabular-nums">
              {time ? formatTime(time) : shift ? `Shift starts ${formatTime(shift.from)}` : '—'}
            </p>
            {checkInNote && state !== 'finished' && <p className={cx('text-xs font-semibold', record?.isLate ? 'text-orange-600' : 'text-green-700')}>{checkInNote}</p>}
          </div>
        </div>
        <div className="mx-auto mt-2 flex items-center gap-3 border-t border-line/70 pt-4">
          <Clock3 size={20} className="text-muted" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-muted">Working Hours</p>
            <p className="text-lg font-extrabold text-ink tabular-nums">{formatDuration(Math.floor(workedMs / 60000))}</p>
          </div>
        </div>
        <Link to="/employee/attendance" className="btn btn-primary mt-5 w-full">
          View Attendance
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </Panel>
  );
}

function UpcomingHolidays({ holidays, index }) {
  return (
    <Panel title="Upcoming Holidays" icon={CalendarDays} iconTone="bg-brand-100 text-brand-700" index={index} action={<ViewAll to="/employee/policy" />}>
      {holidays.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No holidays added" className="py-6" />
      ) : (
        <ul className="divide-y divide-line/70">
          {holidays.slice(0, 3).map((holiday) => {
            const days = daysFromToday(holiday.date);
            return (
              <li key={holiday._id} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                <HolidayArt name={holiday.reason} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted">{formatDate(holiday.date)}</p>
                  <p className="truncate text-sm font-bold text-ink">{holiday.reason}</p>
                </div>
                <span className={cx('shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold whitespace-nowrap', days <= 14 ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700')}>
                  {days <= 0 ? 'Today' : days === 1 ? '1 Day Left' : `${days} Days Left`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function PendingTasks({ tasks, index }) {
  return (
    <Panel title="Pending Tasks" icon={SquareCheckBig} iconTone="bg-sky-600 text-white" index={index} action={<ViewAll to="/employee/tasks" />}>
      {tasks.length === 0 ? (
        <EmptyState icon={ListChecks} title="You’re all caught up" description="No open tasks with a deadline." className="py-6" />
      ) : (
        <ul className="flex-1 divide-y divide-line/70">
          {tasks.slice(0, 3).map((task) => (
            <li key={task._id}>
              <Link to={`/employee/tasks/${task._id}`} className="group flex gap-3 py-3 first:pt-0">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-slate-300 transition-colors group-hover:border-brand-500" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink group-hover:text-brand-700">{task.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className={cx('rounded-md px-2 py-0.5 font-semibold', PRIORITY_CHIPS[task.priority] ?? 'bg-canvas text-muted')}>{task.priority}</span>
                    <span className={cx(isOverdue(task) ? 'font-semibold text-red-600' : 'text-muted')}>Due: {formatDate(task.dueDate)}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto border-t border-line/70 pt-3 text-center">
        <ViewAll to="/employee/tasks">View All Tasks</ViewAll>
      </div>
    </Panel>
  );
}

/* ---------- Birthdays & Anniversaries Card ---------- */
function CelebrationsCard({ items, today, index }) {
  return (
    <Panel
      icon={PartyPopper}
      iconTone="bg-pink-100 text-pink-600"
      title="Birthdays & Anniversaries"
      index={index}
    >
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-500 mb-2">
            <PartyPopper size={20} />
          </div>
          <p className="text-xs font-bold text-ink">No Upcoming Celebrations</p>
          <p className="mt-0.5 text-[11px] text-muted">No birthdays or work anniversaries in next 30 days.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line/60">
          {items.map((item, idx) => {
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
    </Panel>
  );
}

/* ---------- Announcements Card (Matching Admin Design) ---------- */
function Announcements({ items, index }) {
  return (
    <Panel title="Announcements" icon={Megaphone} iconTone="bg-brand-100 text-brand-700" index={index}>
      {items.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nothing new" description="Announcements from HR appear here." className="py-6" />
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {items.slice(0, 5).map((item, idx) => {
            const badge = idx === 0 ? 'Important' : idx === 1 ? 'New' : 'Notice';
            const badgeStyle =
              idx === 0
                ? 'bg-red-50 text-red-600 border-red-200/60'
                : idx === 1
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                : 'bg-sky-50 text-sky-600 border-sky-200/60';
            const dotColor = idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-emerald-500' : 'bg-sky-500';

            return (
              <div
                key={item._id || idx}
                className="rounded-2xl border border-line/80 bg-slate-50/70 p-3.5 transition-all hover:bg-white hover:shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', dotColor)} />
                    <h4 className="text-xs font-bold text-ink truncate">{item.title || 'Announcement'}</h4>
                    <span className={cx('rounded-full px-2 py-0.5 text-[9px] font-bold border shrink-0', badgeStyle)}>
                      {badge}
                    </span>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-muted">
                    {item.date ? formatDate(item.date) : ''}
                  </span>
                </div>
                {item.message && (
                  <p className="text-xs text-slate-600 leading-relaxed pl-4.5 line-clamp-2">{item.message}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

/* ---------- Announcement Popup Modal (Matching Admin Design) ---------- */
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

function KeepGoing({ index }) {
  const ref = useRiseIn(index);
  return (
    <section ref={ref} aria-label="Keep going" className="relative flex min-h-[200px] overflow-hidden rounded-2xl bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 ring-1 ring-green-100">
      <div className="relative z-10 flex w-[46%] min-w-[180px] shrink-0 flex-col justify-center py-6 pl-6 sm:pl-8">
        <h2 className="text-2xl font-extrabold tracking-tight whitespace-nowrap text-slate-900 sm:text-3xl">Keep Going!</h2>
        <p className="mt-2 text-base leading-snug font-medium text-slate-800 sm:text-lg">
          Your hard work
          <br />
          makes a difference.
        </p>
        <span className="mt-3 h-1 w-10 rounded-full bg-green-600" aria-hidden="true" />
        <Link to="/employee/profile" className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800">
          View Profile
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <TrophyIllustration className="relative min-w-0 flex-1 self-end" />
    </section>
  );
}

/* ---------- Main Employee Dashboard Page ---------- */

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi('/dashboard/employee');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(true);

  const today = data?.today || todayISO();

  const month = data?.month || data?.attendance?.monthSummary || {
    workingDaysInMonth: 23,
    present: 0,
    absent: 0,
    wfh: 0,
    onDuty: 0,
    halfDayWorked: 0,
  };
  const leave = data?.leave || { thisMonth: 0 };
  const tasks = data?.tasks || { stats: { open: 0 }, focus: [] };
  const present = (month.present ?? 0) + (month.onDuty ?? 0) + (month.halfDayWorked ?? 0);
  const holidays = data?.holidays || [];
  const focusTasks = tasks.focus || tasks.open || [];
  const announcements = data?.announcements || [];

  /* Birthdays & Anniversaries Celebrations */
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

  /* Announcements for Popup Modal: Show all active announcements */
  const announcementsForModal = useMemo(() => {
    if (!data?.announcements || data.announcements.length === 0) return [];
    return data.announcements.map((a, idx) => ({
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

  if (loading && !data) return <PageLoader />;
  if (error && !data) {
    return (
      <div className="card">
        <EmptyState
          title="Couldn’t load your dashboard"
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
      <Welcome name={user?.name ? user.name.split(' ')[0] : 'Employee'} />

      {/* Row 1: 4 Key Metric Cards */}
      <section aria-label="Your numbers" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarDays} tone="bg-sky-100 text-sky-700" label="Total Working Days" value={month.workingDaysInMonth ?? 23} note="This Month" to="/employee/attendance-monthly" index={1} />
        <StatCard
          icon={CircleCheckBig}
          tone="bg-green-100 text-green-700"
          parts={[
            { label: 'Present', value: present },
            { label: 'Absent', value: month.absent ?? 0 },
            { label: 'WFH', value: month.wfh ?? 0 },
          ]}
          note="This Month"
          to="/employee/attendance-monthly"
          index={2}
        />
        <StatCard
          icon={Plane}
          tone="bg-brand-100 text-brand-700"
          label="Monthly Leave"
          value={leave.thisMonth ?? 0}
          unit={(leave.thisMonth ?? 0) > 0 && (leave.thisMonth ?? 0) <= 1 ? 'Day' : 'Days'}
          note="Taken This Month"
          to="/employee/leaves"
          index={3}
        />
        <StatCard icon={ClipboardList} tone="bg-orange-100 text-orange-600" label="Pending Tasks" value={tasks?.stats?.open ?? 0} note="Tasks" to="/employee/tasks" index={4} />
      </section>

      {/* Row 2: Attendance, Tasks, Holidays */}
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <TodayAttendance index={5} />
        <PendingTasks tasks={focusTasks} index={6} />
        <UpcomingHolidays holidays={holidays} index={7} />
      </div>

      {/* Row 3: Birthdays & Anniversaries, Announcements */}
      <div className="grid gap-5 lg:grid-cols-2">
        <CelebrationsCard items={celebrationsList} today={today} index={8} />
        <Announcements items={announcements} index={9} />
      </div>

      {/* Row 4: Keep Going Banner */}
      <KeepGoing index={10} />

      {/* Announcements Popup Modal (Matching Admin) */}
      {showAnnouncementModal && announcementsForModal.length > 0 && (
        <AnnouncementModal
          items={announcementsForModal}
          onClose={() => setShowAnnouncementModal(false)}
        />
      )}
    </div>
  );
}
