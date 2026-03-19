import { useEffect, useState } from 'react';
import { BarChart2, Star, DollarSign, Clock } from 'lucide-react';
import { api } from '../api/client';
import { GenreChart } from '../components/analytics/GenreChart';
import { GenreBubbleChart } from '../components/analytics/GenreBubbleChart';
import type { GenreStat } from '../types';

type Metric = 'movieCount' | 'avgRating' | 'totalRevenue';

function fmt(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export function GenreAnalyticsPage() {
  const [genres, setGenres] = useState<GenreStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>('movieCount');

  useEffect(() => {
    api.getGenres().then(setGenres).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (error) return <div className="error-banner">{error}</div>;

  const sorted = [...genres].sort((a, b) => (b[metric] as number) - (a[metric] as number));

  const maxCount = Math.max(...genres.map(g => g.movieCount));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22 }}>Genre Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 4 }}>
          Breakdown of movies, ratings, and revenue by genre.
        </p>
      </div>

      {/* Chart */}
      <div className="chart-container" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="chart-title" style={{ margin: 0 }}>Genre Distribution</div>
          <div className="tab-bar">
            <button className={`tab-btn${metric === 'movieCount' ? ' active' : ''}`} onClick={() => setMetric('movieCount')}>Count</button>
            <button className={`tab-btn${metric === 'avgRating' ? ' active' : ''}`} onClick={() => setMetric('avgRating')}>Rating</button>
            <button className={`tab-btn${metric === 'totalRevenue' ? ' active' : ''}`} onClick={() => setMetric('totalRevenue')}>Revenue</button>
          </div>
        </div>
        <GenreChart data={genres} metric={metric} />
      </div>

      {/* Bubble chart */}
      <div className="chart-container" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div className="chart-title" style={{ margin: 0 }}>Quality vs. Commercial Landscape</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12.5, marginTop: 4 }}>
            Each bubble is a genre &nbsp;·&nbsp; X = avg rating &nbsp;·&nbsp; Y = total box office revenue &nbsp;·&nbsp; Size = number of movies
          </div>
        </div>
        <GenreBubbleChart data={genres} />
      </div>

      {/* Genre table */}
      <div className="chart-container">
        <div className="chart-title">All Genres</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Genre</th>
                <th style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BarChart2 size={12} /> Movies</th>
                <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} /> Avg Rating</span></th>
                <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Avg Runtime</span></th>
                <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={12} /> Total Revenue</span></th>
                <th>Rating Range</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((g, i) => (
                <tr key={g.genre}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{g.genre}</div>
                    <div className="progress-bar" style={{ width: 100 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${(g.movieCount / maxCount) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td>{g.movieCount}</td>
                  <td style={{ color: '#fbbf24', fontWeight: 600 }}>{g.avgRating.toFixed(2)}</td>
                  <td>{g.avgRuntime}m</td>
                  <td style={{ color: 'var(--success)' }}>{fmt(g.totalRevenue)}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {g.minRating.toFixed(1)} – {g.maxRating.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
