import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, Clock, TrendingUp, DollarSign, Users, Film, ChevronRight, ExternalLink } from 'lucide-react';
import { api } from '../../api/client';
import type { Movie, MovieAnalytics, CastMember } from '../../types';

const GENRE_GRADIENTS: Record<string, string> = {
  Action:      'linear-gradient(160deg, #1a1a2e 0%, #0f3460 100%)',
  Adventure:   'linear-gradient(160deg, #134e5e 0%, #71b280 100%)',
  Animation:   'linear-gradient(160deg, #4c1d95 0%, #a78bfa 100%)',
  Comedy:      'linear-gradient(160deg, #831843 0%, #ec4899 100%)',
  Crime:       'linear-gradient(160deg, #1c1c1c 0%, #404040 100%)',
  Documentary: 'linear-gradient(160deg, #164e63 0%, #06b6d4 100%)',
  Drama:       'linear-gradient(160deg, #312e81 0%, #6366f1 100%)',
  Fantasy:     'linear-gradient(160deg, #4c1d95 0%, #c084fc 100%)',
  Horror:      'linear-gradient(160deg, #1a0a0a 0%, #7f1d1d 100%)',
  Mystery:     'linear-gradient(160deg, #1e293b 0%, #334155 100%)',
  Romance:     'linear-gradient(160deg, #831843 0%, #e11d48 100%)',
  'Sci-Fi':    'linear-gradient(160deg, #0c1445 0%, #1d4ed8 100%)',
  Thriller:    'linear-gradient(160deg, #0f172a 0%, #374151 100%)',
  Western:     'linear-gradient(160deg, #451a03 0%, #b45309 100%)',
};

function fmt(n?: number) {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function roiColor(cat: string | null) {
  if (cat === 'High')   return 'var(--success)';
  if (cat === 'Medium') return 'var(--warning)';
  if (cat === 'Low')    return 'var(--text-secondary)';
  if (cat === 'Loss')   return 'var(--danger)';
  return 'var(--text-muted)';
}

interface Props {
  movie: Movie;
  onClose: () => void;
  onSelectMovie?: (movie: Movie) => void;
}

export function MovieDrawer({ movie, onClose, onSelectMovie }: Props) {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<MovieAnalytics | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'cast'>('overview');

  const genres = movie.genres?.split(',').map(g => g.trim()) || [];
  const posterGradient = GENRE_GRADIENTS[genres[0] || ''] || 'linear-gradient(160deg, #1e2535, #2d3748)';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setAnalytics(null);
    setCast([]);
    setSimilar([]);

    Promise.allSettled([
      api.getMovieAnalytics(movie.tconst),
      api.getMovieCast(movie.tconst),
      api.getMovieSimilar(movie.tconst, 8),
    ]).then(([analyticsRes, castRes, similarRes]) => {
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      if (castRes.status === 'fulfilled') setCast(castRes.value.cast?.slice(0, 12) || []);
      if (similarRes.status === 'fulfilled') setSimilar(similarRes.value.similar?.slice(0, 6) || []);
      setLoading(false);
    });
  }, [movie.tconst]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel">
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Film size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Movie Detail
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { onClose(); navigate(`/movies/${movie.tconst}`); }}
              style={{ fontSize: 12, gap: 5 }}
            >
              <ExternalLink size={13} /> Full Analytics
            </button>
            <button className="btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        <div className="drawer-body">
          {/* Hero */}
          <div className="drawer-movie-hero">
            <div
              className="drawer-poster"
              style={{ background: posterGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Film size={32} style={{ color: 'rgba(255,255,255,0.25)' }} />
            </div>

            <div className="drawer-movie-info">
              <h2 style={{ fontSize: 18, marginBottom: 6, lineHeight: 1.3 }}>
                {movie.primaryTitle}
              </h2>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {genres.map(g => (
                  <span key={g} className="badge badge-genre">{g}</span>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 12 }}>
                {movie.startYear && (
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{movie.startYear}</span>
                )}
                {movie.runtimeMinutes && (
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {movie.runtimeMinutes}m
                  </span>
                )}
                {movie.averageRating !== undefined && (
                  <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontWeight: 600 }}>
                    <Star size={12} fill="currentColor" /> {movie.averageRating.toFixed(1)}
                    {movie.numVotes !== undefined && (
                      <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                        ({(movie.numVotes / 1000).toFixed(0)}K votes)
                      </span>
                    )}
                  </span>
                )}
              </div>

              {(movie.directors && movie.directors.length > 0) && (
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Director: </strong>
                  {movie.directors.map(d => d.primaryName).join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-bar" style={{ marginBottom: 20 }}>
            {(['overview', 'analytics', 'cast'] as const).map(tab => (
              <button
                key={tab}
                className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={{ textTransform: 'capitalize' }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <>
              {/* Quick stats */}
              <div className="stats-row" style={{ marginBottom: 24 }}>
                <div className="stat-box">
                  <div className="stat-box-label">Revenue</div>
                  <div className="stat-box-value" style={{ color: 'var(--success)', fontSize: 15 }}>
                    {fmt(movie.revenue)}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-label">Budget</div>
                  <div className="stat-box-value" style={{ fontSize: 15 }}>{fmt(movie.budget)}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-label">Popularity</div>
                  <div className="stat-box-value" style={{ fontSize: 15 }}>
                    {movie.popularity?.toFixed(1) ?? '—'}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-label">Type</div>
                  <div className="stat-box-value" style={{ fontSize: 14, textTransform: 'capitalize' }}>
                    {movie.titleType || '—'}
                  </div>
                </div>
              </div>

              {/* Similar movies */}
              {similar.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Similar Movies</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {similar.map(m => (
                      <div
                        key={m.tconst}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        className="card-hover"
                        onClick={() => onSelectMovie?.(m)}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 6,
                            background: GENRE_GRADIENTS[m.genres?.split(',')[0]?.trim() || ''] || 'var(--bg-tertiary)',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.primaryTitle}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                            {m.startYear} · {m.genres?.split(',')[0]}
                          </div>
                        </div>
                        {m.averageRating !== undefined && (
                          <span style={{ fontSize: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                            <Star size={11} fill="currentColor" /> {m.averageRating.toFixed(1)}
                          </span>
                        )}
                        <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab: Analytics */}
          {activeTab === 'analytics' && (
            <>
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <div className="spinner" />
                </div>
              )}

              {!loading && analytics && (
                <>
                  {/* Financials */}
                  <div className="drawer-section">
                    <div className="drawer-section-title">Financials</div>
                    <div className="stats-row">
                      <div className="stat-box">
                        <div className="stat-box-label">Profit</div>
                        <div className="stat-box-value" style={{ fontSize: 15, color: analytics.financials.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {fmt(analytics.financials.profit)}
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-box-label">ROI</div>
                        <div className="stat-box-value" style={{ fontSize: 15, color: roiColor(analytics.financials.roiCategory) }}>
                          {analytics.financials.roi != null ? `${analytics.financials.roi.toFixed(2)}x` : '—'}
                        </div>
                        <div className="stat-box-sub">{analytics.financials.roiCategory || ''}</div>
                      </div>
                    </div>
                  </div>

                  {/* vs Genre Avg */}
                  <div className="drawer-section">
                    <div className="drawer-section-title">vs Genre Average</div>
                    <div className="stats-row">
                      <div className="stat-box">
                        <div className="stat-box-label">Rating Delta</div>
                        <div className="stat-box-value" style={{ fontSize: 15, color: analytics.benchmarks.ratingVsGenreAvg >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {analytics.benchmarks.ratingVsGenreAvg >= 0 ? '+' : ''}{analytics.benchmarks.ratingVsGenreAvg?.toFixed(1) ?? '—'}
                        </div>
                        <div className="stat-box-sub">genre avg: {analytics.benchmarks.genreAvg.avgRating?.toFixed(1)}</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-box-label">Runtime Delta</div>
                        <div className="stat-box-value" style={{ fontSize: 15 }}>
                          {analytics.benchmarks.runtimeVsGenreAvg >= 0 ? '+' : ''}{analytics.benchmarks.runtimeVsGenreAvg ?? '—'}m
                        </div>
                        <div className="stat-box-sub">genre avg: {analytics.benchmarks.genreAvg.avgRuntime}m</div>
                      </div>
                    </div>
                  </div>

                  {/* Rankings */}
                  <div className="drawer-section">
                    <div className="drawer-section-title">Rankings ({movie.startYear})</div>
                    <div className="stats-row">
                      <div className="stat-box">
                        <div className="stat-box-label">Year Rank (Rating)</div>
                        <div className="stat-box-value" style={{ fontSize: 15, color: 'var(--accent-light)' }}>
                          #{analytics.rankings.yearRankByRating ?? '—'}
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-box-label">Genre Rank (Revenue)</div>
                        <div className="stat-box-value" style={{ fontSize: 15, color: 'var(--accent-light)' }}>
                          #{analytics.rankings.genreYearRankByRevenue ?? '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!loading && !analytics && (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <p>Analytics not available for this title.</p>
                </div>
              )}
            </>
          )}

          {/* Tab: Cast */}
          {activeTab === 'cast' && (
            <>
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <div className="spinner" />
                </div>
              )}
              {!loading && cast.length === 0 && (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <Users size={32} />
                  <p>No cast information available.</p>
                </div>
              )}
              {!loading && cast.map(member => (
                <div key={`${member.nconst}-${member.ordering}`} className="person-item">
                  <div className="person-avatar">
                    {member.primaryName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {member.primaryName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {member.category}
                      {member.characters && member.characters !== '\\N' && (
                        <> · {member.characters.replace(/[[\]"]/g, '')}</>
                      )}
                    </div>
                  </div>
                  {member.birthYear && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                      b. {member.birthYear}
                    </span>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// Suppress unused import warnings
const _unused = { DollarSign, TrendingUp, Clock };
void _unused;
