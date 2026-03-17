import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { YearTrend } from '../../types';

interface Props {
  data: YearTrend[];
  metric: 'movieCount' | 'avgRating' | 'totalRevenue';
}

const CONFIG = {
  movieCount:   { label: 'Movies Released', color: '#6366f1', formatter: (v: number) => v.toString() },
  avgRating:    { label: 'Avg Rating',       color: '#fbbf24', formatter: (v: number) => v.toFixed(2) },
  totalRevenue: {
    label: 'Total Revenue',
    color: '#10b981',
    formatter: (v: number) => {
      if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
      if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
      return `$${v.toLocaleString()}`;
    },
  },
};

function CustomTooltip({ active, payload, label, metric }: {
  active?: boolean; payload?: { value: number; name: string }[]; label?: string; metric: Props['metric'];
}) {
  if (!active || !payload?.length) return null;
  const cfg = CONFIG[metric];
  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: cfg.color }}>
          {cfg.label}: <strong>{cfg.formatter(p.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export function TrendsChart({ data, metric }: Props) {
  const cfg = CONFIG[metric];
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={cfg.color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={cfg.formatter}
          width={65}
        />
        <Tooltip content={<CustomTooltip metric={metric} />} cursor={{ stroke: 'var(--border)' }} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 8 }}
        />
        <Area
          type="monotone"
          dataKey={metric}
          name={cfg.label}
          stroke={cfg.color}
          strokeWidth={2.5}
          fill={`url(#gradient-${metric})`}
          dot={false}
          activeDot={{ r: 5, fill: cfg.color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
