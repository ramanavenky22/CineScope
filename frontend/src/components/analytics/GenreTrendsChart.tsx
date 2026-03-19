import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { GenreTrendRow } from '../../types';

const PALETTE = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
  '#a855f7', '#3b82f6', '#e11d48', '#22c55e', '#fb923c',
];

export type GenreTrendMetric = 'movieCount' | 'avgRating';

function pivotRows(rows: GenreTrendRow[], metric: GenreTrendMetric) {
  const byYear: Record<number, Record<string, number | null>> = {};
  rows.forEach(row => {
    if (!byYear[row.year]) byYear[row.year] = {};
    byYear[row.year][row.genre] = metric === 'movieCount' ? row.movieCount : row.avgRating;
  });
  return Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b)
    .map(year => ({ year, ...byYear[year] }));
}

function CustomTooltip({ active, payload, label, metric }: {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
  metric: GenreTrendMetric;
}) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload]
    .filter(p => p.value != null)
    .sort((a, b) => b.value - a.value);

  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '12px 16px',
      fontSize: 12.5,
      minWidth: 190,
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>{label}</div>
      {sorted.map(p => (
        <div
          key={p.dataKey}
          style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4 }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              display: 'inline-block',
              width: 12,
              height: 3,
              borderRadius: 2,
              background: p.color,
            }} />
            <span style={{ color: 'var(--text-secondary)' }}>{p.dataKey}</span>
          </span>
          <span style={{ fontWeight: 600, color: p.color }}>
            {metric === 'avgRating'
              ? Number(p.value).toFixed(2)
              : Number(p.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  genres: string[];
  rows: GenreTrendRow[];
  metric: GenreTrendMetric;
}

export function GenreTrendsChart({ genres, rows, metric }: Props) {
  const [hiddenGenres, setHiddenGenres] = useState<Set<string>>(new Set());

  const chartData = useMemo(() => pivotRows(rows, metric), [rows, metric]);

  const toggleGenre = (genre: string) => {
    setHiddenGenres(prev => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  };

  const yFmt = (v: number) =>
    metric === 'avgRating' ? v.toFixed(1) : v.toLocaleString();

  return (
    <div>
      {/* Pill legend — click to toggle lines */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 7,
        marginBottom: 20,
        justifyContent: 'center',
      }}>
        {genres.map((genre, i) => {
          const color = PALETTE[i % PALETTE.length];
          const hidden = hiddenGenres.has(genre);
          return (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                border: `1.5px solid ${hidden ? 'var(--border)' : color}`,
                background: hidden ? 'transparent' : `${color}1a`,
                color: hidden ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{
                display: 'inline-block',
                width: 14,
                height: 3,
                borderRadius: 2,
                background: hidden ? 'var(--border)' : color,
                transition: 'background 0.15s ease',
              }} />
              {genre}
            </button>
          );
        })}
        {hiddenGenres.size > 0 && (
          <button
            onClick={() => setHiddenGenres(new Set())}
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              border: '1.5px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 11.5,
            }}
          >
            Show all
          </button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 8, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            strokeOpacity={0.5}
            vertical={false}
          />
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
            tickFormatter={yFmt}
            width={52}
            domain={metric === 'avgRating' ? ['auto', 'auto'] : [0, 'auto']}
          />
          <Tooltip
            content={<CustomTooltip metric={metric} genres={genres} />}
            cursor={{ stroke: 'var(--border)', strokeDasharray: '5 4' }}
          />
          {genres.map((genre, i) => (
            <Line
              key={genre}
              type="monotone"
              dataKey={genre}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={hiddenGenres.has(genre) ? 0 : 2.5}
              dot={false}
              activeDot={hiddenGenres.has(genre) ? false : { r: 4, strokeWidth: 0 }}
              hide={hiddenGenres.has(genre)}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)' }}>
        Click a genre pill above to show or hide its line
      </div>
    </div>
  );
}
