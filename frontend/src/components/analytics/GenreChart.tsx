import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import type { GenreStat } from '../../types';

const COLORS = [
  '#6366f1', '#818cf8', '#a5b4fc', '#c4b5fd',
  '#8b5cf6', '#7c3aed', '#4f46e5', '#4338ca',
  '#3730a3', '#312e81', '#6d28d9', '#5b21b6',
];

interface Props {
  data: GenreStat[];
  metric: 'movieCount' | 'avgRating' | 'totalRevenue';
}

const LABELS = {
  movieCount: 'Movie Count',
  avgRating: 'Avg Rating',
  totalRevenue: 'Total Revenue ($)',
};

function fmtRevenue(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

function CustomTooltip({ active, payload, label, metric }: {
  active?: boolean; payload?: { value: number }[]; label?: string; metric: Props['metric'];
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const display = metric === 'totalRevenue' ? fmtRevenue(val) : val.toLocaleString();
  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--accent-light)' }}>{LABELS[metric]}: <strong>{display}</strong></div>
    </div>
  );
}

export function GenreChart({ data, metric }: Props) {
  const sorted = [...data].sort((a, b) => (b[metric] as number) - (a[metric] as number)).slice(0, 12);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={sorted} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="genre"
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          angle={-40}
          textAnchor="end"
          interval={0}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={metric === 'totalRevenue' ? v => fmtRevenue(v) : undefined}
          width={60}
        />
        <Tooltip content={<CustomTooltip metric={metric} />} cursor={{ fill: 'var(--bg-hover)' }} />
        <Bar dataKey={metric} radius={[4, 4, 0, 0]}>
          {sorted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
