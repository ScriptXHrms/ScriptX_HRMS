import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { dropdownIn, dropdownOut, usePresence, useRiseIn } from '../../lib/animate';
import { cx } from '../../utils/cx';
import { formatDayDate } from '../../utils/dateUtils';
import { downloadCsv } from '../../utils/exportCsv';
import { currentMonth, formatMoney, monthLabel } from '../../utils/format';

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

// `text` is the plain value, used for the cell unless `render` is given, and for the CSV.
const COLUMNS = [
  { key: 'date', header: 'Date', className: 'font-medium whitespace-nowrap', text: (day) => formatDayDate(day.date), render: (day) => <DateCell day={day} /> },
  // Lateness shows on the login time's colour, so the status stays a single badge.
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

// Unpaid leave already shows up as LOP; neither type gets its own row.
const HIDDEN_LEAVE_TYPES = ['Unhappy Leave', 'Unpaid Leave'];

const TONE = { red: 'text-red-600', green: 'text-green-700' };
const minus = (value) => (value > 0 ? `-${formatMoney(value)}` : formatMoney(0));

function Panel({ title, index, className, children }) {
  const ref = useRiseIn(index);
  const id = useId();
  return (
    <section ref={ref} aria-labelledby={id} className={cx('card overflow-hidden', className)}>
      <header className="border-b border-line px-5 py-4">
        <h2 id={id} className="text-base font-bold text-ink">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function Lines({ rows }) {
  return (
    <dl className="divide-y divide-line/70 px-5">
      {rows.map(({ label, value, tone }) => (
        <div key={label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <dt className={cx(tone ? TONE[tone] : 'text-muted')}>{label}</dt>
          <dd className={cx('font-bold tabular-nums', tone ? TONE[tone] : 'text-ink')}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PayPanel({ pay, summary, month, index, className }) {
  const { isStipend, pay: p } = pay;
  const word = isStipend ? 'Stipend' : 'Salary';
  const rows = [
    { label: 'Monthly Gross', value: formatMoney(isStipend ? p.stipend : p.gross) },
    { label: 'Payable Days', value: summary.payableDays },
    { label: `Earned ${word}`, value: formatMoney(p.actualGross) },
  ];

  return (
    <Panel title={`${word} Structure – ${monthLabel(month)}`} index={index} className={className}>
      <p className="flex justify-between gap-3 border-b border-line bg-canvas/70 px-5 py-2.5 text-xs font-semibold tracking-wide text-muted uppercase" aria-hidden="true">
        <span>{word} Details</span>
        <span>Amount</span>
      </p>
      <Lines rows={rows} />
      <div className="space-y-3 p-5 pt-2">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-canvas px-4 py-3 text-sm">
          <p className="font-bold text-ink">LOP Deduction</p>
          <p className="font-bold text-red-600 tabular-nums">{minus(p.lopDeduction ?? 0)}</p>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-green-50 px-4 py-3.5 ring-1 ring-green-100 ring-inset">
          <p className="text-base font-bold text-green-800">Net Pay</p>
          <p className="text-lg font-extrabold text-green-700 tabular-nums">{formatMoney(p.netSalary)}</p>
        </div>
      </div>
    </Panel>
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

function SummarySkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr]" aria-hidden="true">
      {[0, 1, 2].map((key) => (
        <div key={key} className="card space-y-3 p-5">
          <div className="skeleton h-5 w-32" />
          {[0, 1, 2, 3, 4, 5].map((line) => (
            <div key={line} className="skeleton h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Month toolbar, attendance / leave / pay summaries and the day-by-day table for the signed-in employee. */
export default function MonthlyAttendanceView({ month, onMonthChange, data, loading, error, onRetry }) {
  // Days up to today since joining: the same days the summaries count. Future holidays and Sundays wait.
  const days = useMemo(() => data?.days?.filter((day) => day.payable !== null), [data]);
  const { summary, breakdown, pay } = data ?? {};

  const exportCsv = () => {
    const cell = (value) => (value === '—' ? '' : value);
    downloadCsv(
      `attendance-${month}.csv`,
      ['S.No', ...COLUMNS.map((column) => column.header)],
      days.map((day, index) => [index + 1, ...COLUMNS.map((column) => cell(column.text(day)))]),
    );
  };

  const workingDays = summary?.monthWorkingDays ?? (summary ? summary.eligibleDays - summary.holidays - summary.weeklyOffs : 0);
  const attended = summary ? summary.present + summary.wfh + summary.onDuty + summary.halfDay * 0.5 : 0;

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-end gap-3 p-4 sm:px-5">
        <div>
          <label htmlFor="monthly-month" className="label">
            Month
          </label>
          <input id="monthly-month" type="month" className="input w-48" value={month} max={currentMonth()} onChange={(e) => e.target.value && onMonthChange(e.target.value)} />
        </div>
        <button type="button" className="btn btn-primary sm:ml-auto" onClick={exportCsv} disabled={!days?.length}>
          <Download size={16} aria-hidden="true" />
          Export CSV
        </button>
      </div>

      {summary ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr]">
          <Panel title="Attendance" index={0}>
            <Lines
              rows={[
                { label: 'Total Days', value: pay.daysInMonth },
                { label: 'Working Days', value: workingDays },
                { label: 'Present Days', value: summary.present },
                { label: 'Work From Home', value: summary.wfh },
                { label: 'Absent Days', value: summary.absent },
                { label: 'Late Login', value: summary.late },
                { label: 'Less Than 8 Hours', value: summary.lessThan8 },
                { label: 'Holidays', value: summary.holidays },
                { label: 'Weekly Offs', value: summary.weeklyOffs },
              ]}
            />
          </Panel>
          <Panel title="Leave & Other Details" index={1}>
            <Lines
              rows={[
                ...breakdown.leaveTypes.filter((type) => !HIDDEN_LEAVE_TYPES.includes(type.name)).map((type) => ({ label: type.name, value: type.days })),
                { label: 'Permission', value: breakdown.permissions },
                { label: 'Half Day', value: summary.halfDay, tone: 'red' },
                { label: 'LOP', value: summary.lop, tone: 'red' },
                { label: 'Late LOP', value: summary.lateLop, tone: 'red' },
                { label: 'Task LOP', value: summary.taskLop ?? 0, tone: 'red' },
                { label: 'Payable Days', value: summary.payableDays, tone: 'green' },
              ]}
            />
          </Panel>
          <RateCard attended={attended} workingDays={workingDays} index={2} className="lg:col-span-2" />
          <PayPanel pay={pay} summary={summary} month={month} index={3} className="lg:col-span-2 xl:col-span-1 xl:col-start-3 xl:row-span-2 xl:row-start-1" />
        </div>
      ) : (
        loading && <SummarySkeleton />
      )}

      <section className="card overflow-hidden">
        <DataTable columns={TABLE_COLUMNS} rows={days} rowKey={(day) => day.date} loading={loading} error={error} onRetry={onRetry} itemLabel="days" caption="Attendance by day" pageSize={31} empty={{ title: 'No attendance yet', description: 'Nothing has been recorded for this month.' }} />
      </section>
    </div>
  );
}
