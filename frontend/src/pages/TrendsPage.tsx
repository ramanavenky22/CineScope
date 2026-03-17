import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { TrendsChart } from '../components/analytics/TrendsChart';
import type { YearTrend } from '../types';

export function TrendsPage() {
  const [trends, setTrends] = useState<YearTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startYear, setStartYear] = useState(2000);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api.getTrends({ startYear })
      .then(setTrends)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [startYear]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (error) return <div className="error-banner">{error}</div>;

  const latestYear = trends[trends.length - 1];
  const firstYear = trends[0];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22 }}>Year Trends</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 4 }}>
            How movies have evolved over time.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>From year:</label>
          <select
            className="input"
            style={{ width: 'auto' }}
            value={startYear}
            onChange={e => setStartYear(Number(e.target.value))}
          >
            {[1990, 1995, 2000, 2005, 2010, 2015, 2018].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      {trends.length > 0 && (
        <div className="kpi-grid" style={{ marginBottom: 24 }}>
          <div className="kpi-card">
            <div className="kpi-label">Latest Year</div>
            <div className="kpi-value">{latestYear?.year}</div>
            <div className="kpi-sub">{latestYear?.movieCount} movies released</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Avg Rating {latestYear?.year}</div>
            <div className="kpi-value">{latestYear?.avgRating.toFixed(2)}</div>
            <div className="kpi-sub">
              vs {firstYear?.avgRating.toFixed(2)} in {firstYear?.year}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Avg Runtime {latestYear?.year}</div>
            <div className="kpi-value">{latestYear?.avgRuntime}m</div>
            <div className="kpi-sub">
              vs {firstYear?.avgRuntime}m in {firstYear?.year}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Peak Year</div>
            <div className="kpi-value">
              {[...trends].sort((a, b) => b.movieCount - a.movieCount)[0]?.year}
            </div>
            <div className="kpi-sub">most movies released</div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="chart-container">
          <div className="chart-title">Movies Released per Year</div>
          <TrendsChart data={trends} metric="movieCount" />
        </div>
        <div className="chart-container">
          <div className="chart-title">Average Rating per Year</div>
          <TrendsChart data={trends} metric="avgRating" />
        </div>
        <div className="chart-container">
          <div className="chart-title">Total Box Office Revenue per Year</div>
          <TrendsChart data={trends} metric="totalRevenue" />
        </div>
      </div>
    </div>
  );
}
