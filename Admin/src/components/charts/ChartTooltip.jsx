/** Shared Recharts tooltip in ScriptX card style. */
export default function ChartTooltip({ active, payload, label, total, unit = '' }) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  const name = entry.payload?.name ?? label ?? entry.name;
  const color = entry.payload?.color ?? entry.color ?? entry.payload?.fill;
  const value = entry.value;
  const pct = total ? Math.round((value / total) * 100) : null;
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-sm shadow-pop">
      <p className="flex items-center gap-2 font-semibold text-ink">
        {color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />}
        {name}
      </p>
      <p className="mt-0.5 text-muted">
        <span className="font-semibold text-ink tabular-nums">{value}</span>
        {unit && ` ${unit}`}
        {pct !== null && ` · ${pct}%`}
      </p>
    </div>
  );
}
