import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coffee, History, LogIn, LogOut, TimerReset } from 'lucide-react';
import AttendanceActions from '../components/AttendanceActions';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import StatusBadge from '../components/StatusBadge';
import { useTodayAttendance } from '../hooks/useTodayAttendance';
import { formatDate, formatDayDate, formatDuration, formatElapsed, formatTime } from '../utils/dateUtils';

const ENTRY_LABEL = {
  Login: { label: 'Login', icon: LogIn, tone: 'bg-green-50 text-green-700' },
  'Break Out': { label: 'Break Out', icon: Coffee, tone: 'bg-gold-100 text-gold-700' },
  'Break In': { label: 'Break In', icon: Coffee, tone: 'bg-brand-50 text-brand-700' },
  Logout: { label: 'Logout', icon: LogOut, tone: 'bg-red-50 text-red-700' },
};

function Row({ label, children }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center sm:gap-6">
      <dt className="text-sm font-semibold text-ink">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function Value({ children }) {
  return <p className="flex min-h-[42px] items-center rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink">{children}</p>;
}

export default function EmployeeAttendance() {
  const attendance = useTodayAttendance();
  const { record, shift, workType, loading, error, reload, workedMs, shiftMinutes, progress, statusLabel, statusTone, helper } = attendance;
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    if (!record) return undefined;
    const q = search.trim().toLowerCase();
    return [...record.entries].reverse().filter((entry) => !q || ENTRY_LABEL[entry.reason].label.toLowerCase().includes(q));
  }, [record, search]);

  const columns = useMemo(
    () => [
      { key: 'date', header: <><span className="hidden sm:inline">Attendance </span>Date</>, render: () => formatDate(record?.date) },
      { key: 'time', header: <><span className="hidden sm:inline">Attendance </span>Time</>, render: (entry) => <time className="tabular-nums whitespace-nowrap">{formatTime(entry.time)}</time> },
      {
        key: 'reason',
        header: 'Reason',
        render: (entry) => {
          const { label, icon: Icon, tone } = ENTRY_LABEL[entry.reason];
          return (
            <span className="flex items-center gap-2.5 font-semibold">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                <Icon size={15} aria-hidden="true" />
              </span>
              {label}
            </span>
          );
        },
      },
    ],
    [record?.date],
  );

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Login, take breaks and logout."
        actions={
          <Link to="/employee/attendance-monthly" className="btn btn-secondary">
            Monthly view
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        }
      />

      <section className="card relative overflow-hidden" aria-labelledby="attendance-title">
        <div className="hex-pattern-soft absolute inset-0" aria-hidden="true" />
        <div className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="attendance-title" className="text-xl font-bold tracking-tight text-ink">
                Today’s Attendance
              </h2>
              <p className="mt-0.5 text-sm text-muted">{formatDayDate(new Date())}</p>
            </div>
            <StatusBadge value={statusLabel} tone={statusTone} />
          </div>

          <dl className="mx-auto mt-6 max-w-xl space-y-3">
            <Row label="Working time">
              <div className="relative overflow-hidden rounded-xl bg-brand-700 px-4 py-3 text-white">
                <div className="hex-pattern absolute inset-0" aria-hidden="true" />
                <div className="relative">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-2xl font-bold tracking-tight tabular-nums" aria-live="off">
                      {formatElapsed(workedMs)}
                    </p>
                    <p className="text-xs text-brand-100">{record?.login ? `Since ${formatTime(record.login)}` : 'Not started yet'}</p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Shift completed" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-gold-400 transition-[width] duration-700" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-brand-200">
                    {Math.round(progress)}% of a {formatDuration(shiftMinutes)} shift
                  </p>
                </div>
              </div>
            </Row>
            <Row label="Scheduled shift">
              <Value>{shift ? `${formatTime(shift.from)} – ${formatTime(shift.to)}` : 'Not assigned'}</Value>
            </Row>
            <Row label="Login">
              <Value>{record?.login ? formatTime(record.login) : '—'}</Value>
            </Row>
            <Row label="Logout">
              <Value>{record?.logout ? formatTime(record.logout) : '—'}</Value>
            </Row>
            <Row label="Work type">
              <Value>{workType ?? '—'}</Value>
            </Row>
          </dl>

          <AttendanceActions attendance={attendance} className="mx-auto mt-6 max-w-md" />
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
            <TimerReset size={13} className="shrink-0" aria-hidden="true" />
            {helper}
          </p>
        </div>
      </section>

      <section className="mt-6" aria-labelledby="attendance-activity">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="attendance-activity" className="text-base font-bold text-ink">
              Today’s activity
            </h2>
            <p className="mt-0.5 text-sm text-muted">Every punch recorded today</p>
          </div>
          <SearchInput id="attendance-search" value={search} onChange={setSearch} placeholder="Search" label="Search today’s activity" className="sm:w-72" />
        </div>
        <div className="card overflow-hidden">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(entry) => entry.time}
            loading={loading}
            error={error}
            onRetry={reload}
            itemLabel="entries"
            caption="Today’s activity"
            fitWidth
            empty={{ icon: History, title: search ? 'No matches' : 'Nothing yet', description: search ? 'Try another word.' : 'Login to start today’s log.' }}
          />
        </div>
      </section>
    </div>
  );
}
