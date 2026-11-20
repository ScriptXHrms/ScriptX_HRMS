import { useMemo, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import { useApi } from '../../hooks/useApi';
import { currentMonth, monthLabel } from '../../utils/format';
import { cx } from '../../utils/cx';

const CELL_STYLE = {
  P: 'bg-green-50 text-green-700',
  WFH: 'bg-brand-50 text-brand-700',
  OD: 'bg-sky-50 text-sky-700',
  HD: 'bg-orange-50 text-orange-700',
  L: 'bg-gold-100 text-gold-700',
  A: 'bg-red-50 text-red-700',
  H: 'bg-sky-100 text-sky-800',
  WO: 'bg-slate-100 text-slate-600',
};

const LEGEND = [
  ['P', 'Present'],
  ['WFH', 'Work from home'],
  ['OD', 'On duty'],
  ['HD', 'Half day'],
  ['L', 'On leave'],
  ['A', 'Absent'],
  ['H', 'Holiday'],
  ['WO', 'Weekly off'],
];

const weekday = (date) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(`${date}T00:00:00`).getDay()];

/** Month grid of every employee's daily status. */
export default function AdminAttendanceTracker() {
  const [month, setMonth] = useState(currentMonth());
  const [search, setSearch] = useState('');
  const { data, loading, error, reload } = useApi(`/attendance/tracker?month=${month}`);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.items ?? []).filter((row) => !q || row.employee.name.toLowerCase().includes(q));
  }, [data, search]);

  const days = data?.items[0]?.days ?? [];

  return (
    <div>
      <PageHeader title="Attendance Tracker" description={`Every employee, every day of ${monthLabel(month)}.`} />
      <section className="card overflow-hidden">
        <FilterBar idPrefix="tracker" search={search} onSearch={setSearch} searchPlaceholder="Search employees…" filters={[{ key: 'month', label: 'Month', type: 'month' }]} values={{ month }} onChange={(_, value) => value && setMonth(value)} />

        <ul className="flex flex-wrap gap-2 border-t border-line px-4 py-3 sm:px-6" aria-label="Legend">
          {LEGEND.map(([code, label]) => (
            <li key={code} className="flex items-center gap-1.5 text-xs text-muted">
              <span className={cx('rounded px-1.5 py-0.5 text-[10px] font-bold', CELL_STYLE[code])}>{code}</span>
              {label}
            </li>
          ))}
          <li className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-4 w-4 rounded ring-1 ring-orange-400" aria-hidden="true" />
            Late login
          </li>
        </ul>

        {error && !data ? (
          <EmptyState icon={TriangleAlert} title="Couldn’t load the tracker" description={error.message} action={<button type="button" className="btn btn-secondary" onClick={reload}>Try again</button>} />
        ) : loading && !data ? (
          <div className="p-6">
            <div className="skeleton h-64 w-full" />
          </div>
        ) : (
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Attendance by employee and day</caption>
              <thead className="border-y border-line bg-canvas/70">
                <tr>
                  <th scope="col" className="th sticky left-0 z-10 min-w-[190px] bg-canvas">Employee</th>
                  {days.map((day) => (
                    <th key={day.date} scope="col" className="px-0.5 py-2 text-center text-[11px] font-semibold text-muted">
                      <span className="block">{weekday(day.date)}</span>
                      <span className="block text-ink">{Number(day.date.slice(8))}</span>
                    </th>
                  ))}
                  <th scope="col" className="th text-center">Pay Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {rows.map((row) => (
                  <tr key={row.employee._id}>
                    <th scope="row" className="sticky left-0 z-10 bg-white px-5 py-2 text-sm font-semibold text-ink sm:pl-6">
                      <Link to={`/admin/attendance-monthly?employee=${row.employee._id}&month=${month}`} className="block max-w-[170px] truncate hover:text-brand-700">
                        {row.employee.name}
                      </Link>
                    </th>
                    {row.days.map((day) => (
                      <td key={day.date} className="px-0.5 py-1.5 text-center">
                        {day.code && day.code !== '-' ? (
                          <span
                            title={`${day.date}: ${day.status}${day.leaveType ? ` (${day.leaveType})` : ''}${day.late ? ', late' : ''}`}
                            className={cx('inline-flex h-6 min-w-6 items-center justify-center rounded px-0.5 text-[10px] font-bold', CELL_STYLE[day.code], day.late && 'ring-1 ring-orange-400')}
                          >
                            {day.code}
                          </span>
                        ) : (
                          <span className="text-xs text-line">·</span>
                        )}
                      </td>
                    ))}
                    <td className="td text-center font-bold tabular-nums">{row.summary.payableDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
