import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { GenreStat } from '../../types';

const PALETTE = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
  '#a855f7', '#3b82f6', '#e11d48', '#22c55e', '#fb923c',
  '#7c3aed', '#0891b2', '#ca8a04', '#64748b', '#78716c',
];

function fmtRevenue(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

function buildColorMap(genres: GenreStat[]) {
  const sorted = [...genres].sort((a, b) => b.movieCount - a.movieCount);
  return Object.fromEntries(sorted.map((g, i) => [g.genre, PALETTE[i % PALETTE.length]]));
}

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: { payload: GenreStat }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '12px 16px',
      fontSize: 13,
      minWidth: 190,
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>{d.genre}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[
          { label: 'Movies', value: d.movieCount.toLocaleString(), color: 'var(--text-primary)' },
          { label: 'Avg Rating', value: d.avgRating.toFixed(2), color: '#fbbf24' },
          { label: 'Total Revenue', value: fmtRevenue(d.totalRevenue), color: 'var(--success)' },
          { label: 'Avg Revenue', value: fmtRevenue(d.avgRevenue), color: 'var(--text-primary)' },
          { label: 'Total Votes', value: d.totalVotes.toLocaleString(), color: 'var(--text-primary)' },
          { label: 'Rating Range', value: `${d.minRating.toFixed(1)} – ${d.maxRating.toFixed(1)}`, color: 'var(--text-muted)' },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
            <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
            <span style={{ fontWeight: 600, color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
  data: GenreStat[];
}

export function GenreBubbleChart({ data }: Props) {
  const withRevenue = useMemo(() => data.filter(g => g.totalRevenue > 0), [data]);
  const excluded = data.length - withRevenue.length;

  const colorMap = useMemo(() => buildColorMap(data), [data]);

  const minCount = useMemo(() => Math.min(...withRevenue.map(g => g.movieCount)), [withRevenue]);
  const maxCount = useMemo(() => Math.max(...withRevenue.map(g => g.movieCount)), [withRevenue]);

  const medRating = useMemo(
    () => withRevenue.reduce((s, g) => s + g.avgRating, 0) / Math.max(1, withRevenue.length),
    [withRevenue],
  );
  const medRevenue = useMemo(() => {
    const sorted = [...withRevenue].map(g => g.totalRevenue).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] ?? 0;
  }, [withRevenue]);

  const renderBubble = useMemo(() => (props: {
    cx?: number; cy?: number; payload?: GenreStat;
  }) => {
    const { cx, cy, payload } = props;
    if (!payload || cx == null || cy == null) return <g />;
    const span = Math.max(1, maxCount - minCount);
    const r = 10 + ((payload.movieCount - minCount) / span) * 28;
    const color = colorMap[payload.genre] ?? '#6366f1';
    const maxChars = Math.floor(r / 4.5);
    const label =
      payload.genre.length > maxChars && r < 24
        ? payload.genre.slice(0, maxChars - 1) + '…'
        : payload.genre;

    return (
      <g key={payload.genre}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={color}
          fillOpacity={0.78}
          stroke={color}
          strokeWidth={1.5}
        />
        <text
          x={cx}
          y={cy + 0.5}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.max(7.5, Math.min(r * 0.52, 11))}
          fill="white"
          fontWeight={700}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {label}
        </text>
      </g>
    );
  }, [minCount, maxCount, colorMap]);

  if (withRevenue.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        No revenue data available for any genre.
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={420}>
        <ScatterChart margin={{ top: 24, right: 32, bottom: 40, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis
            dataKey="avgRating"
            type="number"
            domain={['auto', 'auto']}
            name="Avg Rating"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickCount={6}
            label={{
              value: 'Avg Rating  →',
              position: 'insideBottom',
              offset: -24,
              fill: 'var(--text-muted)',
              fontSize: 11,
            }}
          />
          <YAxis
            dataKey="totalRevenue"
            type="number"
            name="Total Revenue"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickFormatter={fmtRevenue}
            tickLine={false}
            axisLine={false}
            width={68}
            label={{
              value: 'Total Revenue  →',
              angle: -90,
              position: 'insideLeft',
              offset: 16,
              fill: 'var(--text-muted)',
              fontSize: 11,
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <ReferenceLine
            x={medRating}
            stroke="var(--text-muted)"
            strokeDasharray="6 4"
            strokeOpacity={0.45}
          />
          <ReferenceLine
            y={medRevenue}
            stroke="var(--text-muted)"
            strokeDasharray="6 4"
            strokeOpacity={0.45}
          />
          <Scatter data={withRevenue} shape={renderBubble} />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quadrant legend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
        {[
          {
            label: 'Prestige Blockbusters',
            desc: 'High rating · High revenue',
            color: '#10b981',
            corner: 'Top-right',
          },
          {
            label: 'Cash Cows',
            desc: 'Lower rating · High revenue',
            color: '#f59e0b',
            corner: 'Top-left',
          },
          {
            label: 'Critical Darlings',
            desc: 'High rating · Lower revenue',
            color: '#6366f1',
            corner: 'Bottom-right',
          },
          {
            label: 'Niche Genres',
            desc: 'Lower rating · Lower revenue',
            color: 'var(--text-muted)',
            corner: 'Bottom-left',
          },
        ].map(item => (
          <div
            key={item.corner}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-secondary)',
              borderRadius: 6,
              padding: '7px 10px',
            }}
          >
            <div style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: item.color,
              flexShrink: 0,
            }} />
            <div style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 5 }}>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center' }}>
        Dashed lines = median rating &amp; median revenue &nbsp;·&nbsp; Bubble size = number of movies
        {excluded > 0 && (
          <span> &nbsp;·&nbsp; {excluded} genre{excluded !== 1 ? 's' : ''} with no revenue data excluded</span>
        )}
      </div>
    </div>
  );
}
