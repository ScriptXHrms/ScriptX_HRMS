import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip';

/**
 * Attendance colours (validated for colour-vision separation on white).
 * Identity never relies on colour alone: the legend below always shows
 * label, count and share.
 */
export const ATTENDANCE_COLORS = {
  Present: '#16A34A',
  'Work From Home': '#6236B8',
  'On Leave': '#C98A00',
  Absent: '#DC2626',
};

export default function AttendanceDonut({ summary, centerLabel = 'working today' }) {
  const data = Object.keys(ATTENDANCE_COLORS).map((name) => ({
    name,
    value: summary[name] ?? 0,
    color: ATTENDANCE_COLORS[name],
  }));
  const total = summary.total;
  const working = (summary.Present ?? 0) + (summary['Work From Home'] ?? 0);

  return (
    <div>
      <div className="relative mx-auto h-52 w-full max-w-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.filter((d) => d.value > 0)}
              dataKey="value"
              nameKey="name"
              innerRadius="70%"
              outerRadius="96%"
              startAngle={90}
              endAngle={-270}
              stroke="#FFFFFF"
              strokeWidth={2}
              isAnimationActive
            >
              {data
                .filter((d) => d.value > 0)
                .map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
            </Pie>
            <Tooltip content={(props) => <ChartTooltip {...props} total={total} unit="employees" />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-3xl font-bold text-ink tabular-nums">{total ? Math.round((working / total) * 100) : 0}%</p>
          <p className="text-xs font-medium text-muted">{centerLabel}</p>
        </div>
      </div>

      <ul className="mt-5 space-y-2" aria-label="Attendance breakdown">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-muted">{d.name}</span>
            <span className="text-sm font-bold text-ink tabular-nums">{d.value}</span>
            <span className="w-10 text-right text-xs text-muted tabular-nums">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
