import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';

/**
 * Single-series horizontal bar chart (one brand colour — the axis carries
 * identity). Bars are clickable when `onSelect` is provided.
 */
export default function TaskStatusChart({ data, onSelect }) {
  const height = Math.max(200, data.length * 40 + 24);
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }} barCategoryGap={12}>
          <CartesianGrid horizontal={false} stroke="#EFEBF4" />
          <XAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#706B7C', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={128}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#171323', fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip cursor={{ fill: '#F6F2FD' }} content={(props) => <ChartTooltip {...props} unit="tasks" />} />
          <Bar
            dataKey="value"
            fill="#40108C"
            barSize={16}
            radius={[0, 4, 4, 0]}
            onClick={onSelect ? (entry) => onSelect(entry?.payload?.name ?? entry?.name) : undefined}
            style={onSelect ? { cursor: 'pointer' } : undefined}
          >
            <LabelList dataKey="value" position="right" fill="#706B7C" fontSize={12} fontWeight={600} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
