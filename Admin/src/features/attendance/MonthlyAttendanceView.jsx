import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarCheck, CalendarX2, Clock3, Download, House, Plane, Timer, Wallet } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { dropdownIn, dropdownOut, usePresence, useRiseIn } from '../../lib/animate';
import { cx } from '../../utils/cx';
import { formatDayDate, formatDuration } from '../../utils/dateUtils';
import { downloadCsv } from '../../utils/exportCsv';
import { currentMonth } from '../../utils/format';

const WORK_TYPE = { Office: 'WFO', WFH: 'WFH', 'On Duty': 'On Duty' };
const pad = (n) => String(n).padStart(2, '0');

// This table's fixed formats: punch times as 24-hour "15:57:12", durations as "00:32:00",
// values only known to the minute (task times) as "06:00".
function clock(value) {
  if (!value) return '—';
  if (typeof value === 'string' && /^\d{1,2}:\d{2}$/.test(value)) return value.padStart(5, '0');
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function hms(seconds) {
  const total = Math.max(0, Math.round(seconds));
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

const hm = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(Math.round(minutes) % 60)}`;
const breakText = (day) => (day.summary ? `${hms(day.summary.breakSeconds)}${day.summary.breakCount ? ` (${day.summary.breakCount})` : ''}` : '—');
const TOOLTIP_WIDTH = 256;

function DateCell({ day }) {
  return (
    <span className="relative inline-block">
      {day.autoLogout && (
        <span className="absolute -top-3.5 -left-4 -rotate-12 rounded-md bg-brand-700 px-1.5 py-px text-[9px] font-bold tracking-wide text-white uppercase shadow-sm" title="Logged out automatically at 23:59">
          Auto
        </span>
      )}
      {formatDayDate(day.date)}
      {day.autoLogout && <span className="sr-only"> (logged out automatically)</span>}
    </span>
  );
}

// After shift start: up to 10 minutes is normal, up to 15 is yellow, later is red.
function LoginCell({ day }) {
  if (!day.summary?.login) return '—';
  const delay = day.loginDelay;
  const tone = delay > 15 ? 'bg-red-50 text-red-700 ring-red-200' : delay > 10 ? 'bg-gold-100 text-gold-700 ring-gold-300' : null;
  const note = delay > 0 ? `${delay} min after the ${clock(day.shiftFrom)} shift start` : undefined;
  return (
    <span title={note} className={cx('tabular-nums', tone && 'inline-flex rounded-md px-1.5 py-0.5 font-semibold ring-1 ring-inset', tone)}>
      {clock(day.summary.login)}
      {tone && <span className="sr-only">, {note}</span>}
    </span>
  );
}

/** Break total and count; hovering or focusing it lists each Break Out and Break In. */
function BreakCell({ day }) {
  const ref = useRef(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [mounted, panelRef] = usePresence(open, dropdownIn, dropdownOut);
  const breaks = day.summary?.breaks ?? [];

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [open]);

  if (!breaks.length) return breakText(day);
  const show = () => {
    const box = ref.current.getBoundingClientRect();
    const left = Math.min(Math.max(8, box.left + box.width / 2 - TOOLTIP_WIDTH / 2), window.innerWidth - TOOLTIP_WIDTH - 8);
    setPosition({ left, top: box.bottom + 8 });
    setOpen(true);
  };
  const hide = () => setOpen(false);

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-describedby={open ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="cursor-help rounded tabular-nums underline decoration-muted decoration-dotted underline-offset-4 transition-colors hover:text-brand-700"
      >
        {breakText(day)}
      </button>
      {mounted &&
        createPortal(
          <div ref={panelRef} id={id} role="tooltip" style={{ position: 'fixed', left: position.left, top: position.top, width: TOOLTIP_WIDTH }} className="z-[70] rounded-xl border border-line bg-white p-3 text-xs shadow-pop">
            <p className="mb-2 font-semibold text-ink">Breaks · {formatDayDate(day.date)}</p>
            <ul className="space-y-1.5">
              {breaks.map((entry) => (
                <li key={entry.out} className="flex items-center justify-between gap-3 tabular-nums">
                  <span className="text-muted">
                    Break Out <span className="font-semibold text-ink">{clock(entry.out)}</span>
                  </span>
                  <span className="text-muted">
                    Break In <span className="font-semibold text-ink">{clock(entry.in)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}

function RateCard({ attended, workingDays, index, className }) {
  const ref = useRiseIn(index);
  const rate = workingDays > 0 ? Math.min(100, Math.round((attended / workingDays) * 100)) : 0;
  return (
    <section ref={ref} className={cx('card px-5 py-4', className)} aria-label="Attendance rate">
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="font-semibold text-ink">Attendance Rate</p>
        <p className="font-bold text-ink tabular-nums">{rate}%</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-50" role="progressbar" aria-label="Attendance rate" aria-valuenow={rate} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand-700 transition-[width] duration-700" style={{ width: `${rate}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">
        {attended} of {workingDays} working days attended
      </p>
    </section>
  );
}

const COLUMNS = [
  { key: 'date', header: 'Date', className: 'font-medium whitespace-nowrap', text: (day) => formatDayDate(day.date), render: (day) => <DateCell day={day} /> },
  { key: 'status', header: 'Status', text: (day) => day.status, render: (day) => <StatusBadge value={day.status} /> },
  { key: 'workType', header: 'Work Type', text: (day) => WORK_TYPE[day.workType] ?? day.leaveType ?? day.holidayReason ?? '—' },
  { key: 'shiftName', header: 'Shift', text: (day) => day.shiftName ?? '—' },
  { key: 'login', header: 'Login Time', className: 'whitespace-nowrap', text: (day) => clock(day.summary?.login), render: (day) => <LoginCell day={day} /> },
  { key: 'logout', header: 'Logout Time', className: 'tabular-nums', text: (day) => (day.autoLogout ? `${clock(day.summary?.logout)} (auto)` : clock(day.summary?.logout)), render: (day) => clock(day.summary?.logout) },
  { key: 'projectStart', header: 'Project Start', className: 'tabular-nums', text: (day) => clock(day.projectStart) },
  {
    key: 'break',
    header: 'Break',
    className: 'whitespace-nowrap',
    text: breakText,
    render: (day) => <BreakCell day={day} />,
  },
  { key: 'total', header: 'Total Hours', className: 'tabular-nums', text: (day) => (day.summary ? hms(day.summary.totalSeconds) : '—') },
  { key: 'task', header: 'Task Hours', className: 'tabular-nums', text: (day) => (day.taskMinutes ? hm(day.taskMinutes) : '—') },
  { key: 'payable', header: 'Payable Time', className: 'tabular-nums', text: (day) => (day.summary ? hms(day.summary.payableSeconds) : '—') },
];

const TABLE_COLUMNS = [
  { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
  ...COLUMNS.map((column) => ({ ...column, render: column.render ?? column.text })),
];

/** Summary tiles, attendance rate, and day-by-day table for the monthly view. */
export default function MonthlyAttendanceView({ data, loading, error, onRetry, month }) {
  // Days up to today since joining: the same days the summaries count. Future holidays and Sundays wait.
  const days = useMemo(() => data?.days?.filter((day) => day.payable !== null), [data]);
  const summary = data?.summary;

  const exportCsv = () => {
    if (!days?.length) return;
    const cell = (value) => (value === '—' ? '' : value);
    downloadCsv(
      `attendance-${month || currentMonth()}.csv`,
      ['S.No', ...COLUMNS.map((column) => column.header)],
      days.map((day, index) => [index + 1, ...COLUMNS.map((column) => cell(column.text(day)))]),
    );
  };

  const workingDays = summary?.monthWorkingDays ?? (summary ? summary.eligibleDays - summary.holidays - summary.weeklyOffs : 0);
  const attended = summary ? summary.present + summary.wfh + summary.onDuty + summary.halfDay * 0.5 : 0;

  const stats = summary
    ? [
        { title: 'Present', value: summary.present, icon: CalendarCheck, tone: 'green', hint: `${summary.onDuty} on duty` },
        { title: 'Work From Home', value: summary.wfh, icon: House, tone: 'brand' },
        { title: 'Leave', value: summary.leave, icon: Plane, tone: 'gold', hint: `${summary.paidLeave} paid · ${summary.unpaidLeave} unpaid` },
        { title: 'Absent', value: summary.absent, icon: CalendarX2, tone: 'red', hint: `${summary.halfDay} half days` },
        { title: 'Late Logins', value: summary.late, icon: Timer, tone: 'orange', hint: summary.lateLop ? `${summary.lateLop} day late LOP` : 'No late LOP' },
        { title: 'Below 8 Hours', value: summary.lessThan8, icon: Clock3, tone: 'sky' },
        { title: 'Working Hours', value: formatDuration(summary.payableMinutes), icon: Clock3, tone: 'brand' },
        { title: 'Payable Days', value: summary.payableDays, icon: Wallet, tone: 'green', hint: `of ${workingDays} working days` },
      ]
    : [];

  return (
    <div className="space-y-6">
      {stats.length > 0 && (
        <section aria-label="Month summary" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.title} index={index} {...stat} />
          ))}
        </section>
      )}

      {summary && <RateCard attended={attended} workingDays={workingDays} index={stats.length} />}

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="text-sm font-bold text-ink">Attendance by day</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={exportCsv} disabled={!days?.length}>
            <Download size={14} aria-hidden="true" />
            Export CSV
          </button>
        </div>
        <DataTable
          columns={TABLE_COLUMNS}
          rows={days}
          rowKey={(day) => day.date}
          loading={loading}
          error={error}
          onRetry={onRetry}
          itemLabel="days"
          caption="Attendance by day"
          pageSize={31}
          empty={{ title: 'No attendance yet', description: 'Nothing has been recorded for this month.' }}
        />
      </section>
    </div>
  );
}
