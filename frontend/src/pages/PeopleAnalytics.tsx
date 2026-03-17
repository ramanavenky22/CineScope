import { useEffect, useState } from 'react';
import { Star, Film, DollarSign, Users } from 'lucide-react';
import { api } from '../api/client';
import type { DirectorStat, ActorStat } from '../types';

function fmt(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n > 0) return `$${n.toLocaleString()}`;
  return '—';
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function PeopleAnalytics() {
  const [directors, setDirectors] = useState<DirectorStat[]>([]);
  const [actors, setActors] = useState<ActorStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'directors' | 'actors'>('directors');
  const [minMovies, setMinMovies] = useState(2);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.allSettled([
      api.getDirectors({ limit: 50, minMovies }),
      api.getActors({ limit: 50, minMovies }),
    ]).then(([dirsR, actsR]) => {
      if (dirsR.status === 'fulfilled') setDirectors(dirsR.value);
      if (actsR.status === 'fulfilled') setActors(actsR.value);
      if (dirsR.status === 'rejected') setError(dirsR.reason?.message);
      setLoading(false);
    });
  }, [minMovies]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22 }}>Directors & Actors</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 4 }}>
            Top performers ranked by ratings and movie count.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Min movies:</label>
          <select
            className="input"
            style={{ width: 'auto' }}
            value={minMovies}
            onChange={e => setMinMovies(Number(e.target.value))}
          >
            {[1, 2, 3, 5].map(n => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button className={`tab-btn${tab === 'directors' ? ' active' : ''}`} onClick={() => setTab('directors')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Film size={13} /> Directors</span>
        </button>
        <button className={`tab-btn${tab === 'actors' ? ' active' : ''}`} onClick={() => setTab('actors')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={13} /> Actors</span>
        </button>
      </div>

      {/* Directors table */}
      {tab === 'directors' && (
        <div className="chart-container" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Director</th>
                <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Film size={12} /> Movies</span></th>
                <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} /> Avg Rating</span></th>
                <th>Best Rating</th>
                <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={12} /> Total Revenue</span></th>
              </tr>
            </thead>
            <tbody>
              {directors.map((d, i) => (
                <tr key={d.nconst}>
                  <td style={{ color: i < 3 ? 'var(--accent-light)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {i + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="person-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                        {initials(d.primaryName)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{d.primaryName}</div>
                        {d.birthYear && <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>b. {d.birthYear}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{d.movieCount}</td>
                  <td style={{ color: '#fbbf24', fontWeight: 600 }}>{d.avgRating.toFixed(2)}</td>
                  <td style={{ color: 'var(--success)' }}>{d.maxRating.toFixed(1)}</td>
                  <td style={{ color: 'var(--info)' }}>{fmt(d.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Actors table */}
      {tab === 'actors' && (
        <div className="chart-container" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Actor / Actress</th>
                <th>Role</th>
                <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Film size={12} /> Movies</span></th>
                <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} /> Avg Rating</span></th>
                <th>Best Rating</th>
              </tr>
            </thead>
            <tbody>
              {actors.map((a, i) => (
                <tr key={a.nconst}>
                  <td style={{ color: i < 3 ? 'var(--accent-light)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {i + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="person-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                        {initials(a.primaryName)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{a.primaryName}</div>
                        {a.birthYear && <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>b. {a.birthYear}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${a.category === 'actress' ? 'badge-info' : 'badge-muted'}`}>
                      {a.category}
                    </span>
                  </td>
                  <td>{a.movieCount}</td>
                  <td style={{ color: '#fbbf24', fontWeight: 600 }}>{a.avgRating.toFixed(2)}</td>
                  <td style={{ color: 'var(--success)' }}>{a.bestRating.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
