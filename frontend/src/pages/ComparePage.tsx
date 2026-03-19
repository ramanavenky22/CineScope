import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, X, Sparkles } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { api } from '../api/client';
import { useCompare } from '../contexts/CompareContext';
import type { Movie, MovieAnalytics } from '../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

function fmt(n?: number | null) {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, MovieAnalytics>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareList.length === 0) return;
    setLoading(true);
    Promise.allSettled(compareList.map(m => api.getMovieAnalytics(m.tconst)))
      .then(results => {
        const map: Record<string, MovieAnalytics> = {};
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') map[compareList[i].tconst] = r.value;
        });
        setAnalyticsMap(map);
      })
      .finally(() => setLoading(false));
  }, [compareList]);

  if (compareList.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Compare Movies</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
          Select 2-3 movies to compare side by side.
        </p>
        <div className="empty-state">
          <Scale size={48} />
          <p>No movies selected for comparison.</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Go to the Movies page and click the compare button on movie cards.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/movies')}>
            Browse Movies
          </button>
        </div>
      </div>
    );
  }

  const metrics = compareList.map(m => {
    const a = analyticsMap[m.tconst];
    return {
      movie: m,
      rating: m.averageRating ?? 0,
      revenue: m.revenue ?? 0,
      budget: m.budget ?? 0,
      roi: a?.financials.roi ?? 0,
      runtime: m.runtimeMinutes ?? 0,
      popularity: m.popularity ?? 0,
      votes: m.numVotes ?? 0,
    };
  });

  // Radar data (normalized 0-100)
  const radarKeys = [
    { label: 'Rating', key: 'rating' as const },
    { label: 'Revenue', key: 'revenue' as const },
    { label: 'Budget', key: 'budget' as const },
    { label: 'ROI', key: 'roi' as const },
    { label: 'Runtime', key: 'runtime' as const },
    { label: 'Popularity', key: 'popularity' as const },
    { label: 'Votes', key: 'votes' as const },
  ];

  const radarData = radarKeys.map(({ label, key }) => {
    const values = metrics.map(m => m[key]);
    const max = Math.max(...values, 1);
    const entry: Record<string, string | number> = { metric: label };
    metrics.forEach((m, i) => {
      entry[`movie${i}`] = key === 'rating' ? m[key] * 10 : (m[key] / max) * 100;
    });
    return entry;
  });

  // Revenue bar chart data
  const revenueData = metrics.map((m, i) => ({
    name: m.movie.primaryTitle.length > 18
      ? m.movie.primaryTitle.slice(0, 16) + '...'
      : m.movie.primaryTitle,
    revenue: m.revenue,
    color: COLORS[i],
  }));

  const insights = generateComparisonInsights(metrics);

  const TABLE_ROWS = [
    { label: 'Rating', key: 'rating' as const, format: (v: number) => v ? v.toFixed(1) + '/10' : '—' },
    { label: 'Votes', key: 'votes' as const, format: (v: number) => v ? v.toLocaleString() : '—' },
    { label: 'Revenue', key: 'revenue' as const, format: (v: number) => fmt(v) },
    { label: 'Budget', key: 'budget' as const, format: (v: number) => fmt(v) },
    { label: 'ROI', key: 'roi' as const, format: (v: number) => v ? `${v.toFixed(1)}x` : '—' },
    { label: 'Runtime', key: 'runtime' as const, format: (v: number) => v ? `${v} min` : '—' },
    { label: 'Popularity', key: 'popularity' as const, format: (v: number) => v ? v.toFixed(1) : '—' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22 }}>Compare Movies</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 4 }}>
            Side-by-side comparison of {compareList.length} movies
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/movies')}>
            Add More
          </button>
          <button className="btn btn-ghost btn-sm" onClick={clearCompare}>
            Clear All
          </button>
        </div>
      </div>

      {/* Movie Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareList.length}, 1fr)`, gap: 16, marginBottom: 24 }}>
        {compareList.map((m, i) => {
          const genreStr = typeof m.genres === 'string' ? m.genres : (m.genres as unknown as string[])?.join(', ');
          return (
            <div key={m.tconst} className="compare-movie-header" style={{ borderColor: COLORS[i] }}>
              <button
                className="compare-remove-btn"
                onClick={() => removeFromCompare(m.tconst)}
              >
                <X size={12} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 6, height: 40, borderRadius: 3, background: COLORS[i], flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.primaryTitle}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {m.startYear} · {genreStr?.split(',')[0]}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : (
        <>
          {/* Comparison Table */}
          <div className="chart-container" style={{ marginBottom: 24, padding: 0, overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {compareList.map((m, i) => (
                    <th key={m.tconst} style={{ color: COLORS[i] }}>
                      {m.primaryTitle.length > 22 ? m.primaryTitle.slice(0, 20) + '...' : m.primaryTitle}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map(row => {
                  const values = metrics.map(m => m[row.key]);
                  const maxVal = Math.max(...values);
                  const higherBetter = row.key !== 'budget';

                  return (
                    <tr key={row.label}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.label}</td>
                      {metrics.map((m, i) => {
                        const val = m[row.key];
                        const isBest = higherBetter && val === maxVal && val > 0 && values.filter(v => v === maxVal).length === 1;
                        return (
                          <td key={i} style={{
                            color: isBest ? 'var(--success)' : undefined,
                            fontWeight: isBest ? 600 : undefined,
                          }}>
                            {row.format(val)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Radar Chart */}
            <div className="chart-container">
              <div className="chart-title">Performance Radar</div>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: -6, marginBottom: 16 }}>
                Normalized comparison across all metrics
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  {compareList.map((m, i) => (
                    <Radar
                      key={m.tconst}
                      name={m.primaryTitle.length > 20 ? m.primaryTitle.slice(0, 18) + '...' : m.primaryTitle}
                      dataKey={`movie${i}`}
                      stroke={COLORS[i]}
                      fill={COLORS[i]}
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Bar Chart */}
            <div className="chart-container">
              <div className="chart-title">Revenue Comparison</div>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: -6, marginBottom: 16 }}>
                Box office performance head to head
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={v => fmt(v)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} width={64} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
                          <div style={{ color: 'var(--text-secondary)' }}>Revenue: <strong>{fmt(payload[0].value as number)}</strong></div>
                        </div>
                      );
                    }}
                    cursor={{ fill: 'var(--bg-hover)' }}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {revenueData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Comparison Insights */}
          {insights.length > 0 && (
            <div className="chart-container">
              <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                Comparison Insights
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {insights.map((insight, i) => (
                  <div key={i} className="insight-card">
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

type MetricEntry = {
  movie: Movie;
  rating: number;
  revenue: number;
  budget: number;
  roi: number;
  runtime: number;
  popularity: number;
  votes: number;
};

function generateComparisonInsights(metrics: MetricEntry[]): string[] {
  if (metrics.length < 2) return [];
  const insights: string[] = [];

  // Best rated
  const bestRated = [...metrics].sort((a, b) => b.rating - a.rating)[0];
  if (bestRated.rating > 0) {
    insights.push(`"${bestRated.movie.primaryTitle}" has the highest rating at ${bestRated.rating.toFixed(1)}/10.`);
  }

  // Highest revenue
  const topRev = [...metrics].sort((a, b) => b.revenue - a.revenue)[0];
  if (topRev.revenue > 0) {
    const revStr = topRev.revenue >= 1e9 ? `$${(topRev.revenue / 1e9).toFixed(2)}B` : topRev.revenue >= 1e6 ? `$${(topRev.revenue / 1e6).toFixed(0)}M` : `$${topRev.revenue.toLocaleString()}`;
    insights.push(`"${topRev.movie.primaryTitle}" earned the most at the box office with ${revStr}.`);
  }

  // Best ROI
  const bestROI = [...metrics].sort((a, b) => b.roi - a.roi)[0];
  if (bestROI.roi > 0) {
    insights.push(`"${bestROI.movie.primaryTitle}" delivered the best return on investment at ${bestROI.roi.toFixed(1)}x.`);
  }

  // Critical vs commercial divergence
  const ratingOrder = [...metrics].sort((a, b) => b.rating - a.rating);
  const revenueOrder = [...metrics].sort((a, b) => b.revenue - a.revenue);
  if (ratingOrder[0].movie.tconst !== revenueOrder[0].movie.tconst && revenueOrder[0].revenue > 0 && ratingOrder[0].rating > 0) {
    insights.push(`"${ratingOrder[0].movie.primaryTitle}" rated highest but "${revenueOrder[0].movie.primaryTitle}" earned more — critical success vs. commercial success.`);
  }

  // Runtime difference
  const runtimes = metrics.filter(m => m.runtime > 0);
  if (runtimes.length >= 2) {
    const longest = [...runtimes].sort((a, b) => b.runtime - a.runtime)[0];
    const shortest = [...runtimes].sort((a, b) => a.runtime - b.runtime)[0];
    if (longest.runtime - shortest.runtime > 15) {
      insights.push(`"${longest.movie.primaryTitle}" runs ${longest.runtime - shortest.runtime} minutes longer than "${shortest.movie.primaryTitle}".`);
    }
  }

  return insights;
}
