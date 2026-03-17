import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, Clock, Film, ChevronLeft, ChevronRight,
  Users, DollarSign, TrendingUp, Award, BarChart2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { api } from '../api/client';
import type { Movie, MovieAnalytics, CastMember, GenrePeersResponse } from '../types';

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

function fmt(n?: number | null) {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtK(n?: number | null) {
  if (!n) return '—';
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

function roiColor(cat: string | null) {
  if (cat === 'High')   return 'var(--success)';
  if (cat === 'Medium') return 'var(--warning)';
  if (cat === 'Low')    return 'var(--text-secondary)';
  if (cat === 'Loss')   return 'var(--danger)';
  return 'var(--text-muted)';
}

function RatingTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name: string }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: 'var(--text-secondary)' }}>
          {p.name}: <strong style={{ color: 'var(--text-primary)' }}>{p.value?.toFixed(1)}</strong>
        </div>
      ))}
    </div>
  );
}

function FinancialTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--text-secondary)' }}>Amount: <strong style={{ color: 'var(--text-primary)' }}>{fmt(payload[0].value)}</strong></div>
    </div>
  );
}

function PeersTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; payload: { isTarget: boolean; fullName: string; numVotes?: number } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13, maxWidth: 220 }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: entry.payload.isTarget ? 'var(--accent-light)' : 'var(--text-primary)' }}>
        {entry.payload.fullName || label}
        {entry.payload.isTarget && <span style={{ fontSize: 11, marginLeft: 6, color: 'var(--accent)', background: 'var(--accent-dim)', borderRadius: 4, padding: '1px 5px' }}>This Movie</span>}
      </div>
      <div style={{ color: 'var(--text-secondary)' }}>
        Rating: <strong style={{ color: '#fbbf24' }}>{entry.value?.toFixed(1)}</strong>
      </div>
      {entry.payload.numVotes && (
        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
          {fmtK(entry.payload.numVotes)} votes
        </div>
      )}
    </div>
  );
}

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [analytics, setAnalytics] = useState<MovieAnalytics | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [peers, setPeers] = useState<GenrePeersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadMovieData = async () => {
      setLoading(true);
      setError(null);

      const [movieRes, analyticsRes, castRes, similarRes, peersRes] = await Promise.allSettled([
        api.getMovie(id),
        api.getMovieAnalytics(id),
        api.getMovieCast(id),
        api.getMovieSimilar(id, 6),
        api.getMovieGenrePeers(id, 15),
      ]);

      if (movieRes.status === 'fulfilled') setMovie(movieRes.value);
      else setError('Movie not found');
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      if (castRes.status === 'fulfilled') setCast(castRes.value.cast?.slice(0, 12) || []);
      if (similarRes.status === 'fulfilled') setSimilar(similarRes.value.similar?.slice(0, 6) || []);
      if (peersRes.status === 'fulfilled') setPeers(peersRes.value);
      setLoading(false);
    };

    loadMovieData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div>
        <button
          onClick={() => navigate('/movies')}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16 }}
        >
          <ChevronLeft size={14} /> Back to Movies
        </button>
        <div className="error-banner">{error || 'Movie not found.'}</div>
      </div>
    );
  }

  // getMovie returns genres as an array; getMovies returns it as a comma string
  const genres: string[] = Array.isArray(movie.genres)
    ? (movie.genres as unknown as string[])
    : (movie.genres?.split(',').map(g => g.trim()) ?? []);

  const primaryGenre = genres[0] ?? '';
  const posterGradient = GENRE_GRADIENTS[primaryGenre] ?? 'linear-gradient(160deg, #1e2535, #2d3748)';

  // Rating benchmark chart data
  const ratingBenchmarkData = [
    { name: 'This Movie', value: movie.averageRating ?? 0 },
    { name: `${primaryGenre || 'Genre'} Avg`, value: analytics?.benchmarks.genreAvg?.avgRating ?? 0 },
    { name: `${movie.startYear ?? ''} Avg`, value: analytics?.benchmarks.yearAvg?.avgRating ?? 0 },
  ].filter(d => d.value > 0);

  // Runtime comparison data
  const runtimeData = [
    { name: 'This Movie', value: movie.runtimeMinutes ?? 0 },
    { name: `${primaryGenre || 'Genre'} Avg`, value: Math.round(analytics?.benchmarks.genreAvg?.avgRuntime ?? 0) },
  ].filter(d => d.value > 0);

  // Financial chart data
  const budget = analytics?.financials.budget ?? movie.budget ?? 0;
  const revenue = analytics?.financials.revenue ?? movie.revenue ?? 0;
  const profit = analytics?.financials.profit ?? 0;
  const financialData = [
    { name: 'Budget', value: budget, color: 'var(--text-muted)' },
    { name: 'Revenue', value: revenue, color: 'var(--success)' },
    ...(profit !== null && profit !== 0
      ? [{ name: 'Profit', value: Math.abs(profit), color: profit >= 0 ? 'var(--info)' : 'var(--danger)' }]
      : []),
  ].filter(d => d.value > 0);

  // Genre peers chart data (sorted descending by rating)
  const peersChartData = (peers?.peers ?? [])
    .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    .map(p => ({
      name: p.primaryTitle.length > 24 ? p.primaryTitle.slice(0, 22) + '…' : p.primaryTitle,
      fullName: p.primaryTitle,
      rating: p.averageRating ?? 0,
      numVotes: p.numVotes,
      isTarget: p.isTarget,
    }));

  const yearWindow = 5;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/movies')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: 13, padding: '0 0 20px 0',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <ChevronLeft size={16} /> Back to Movies
      </button>

      {/* Hero Card */}
      <div style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: 20,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Gradient banner */}
        <div style={{
          height: 168,
          background: posterGradient,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 28px 20px',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 100%)' }} />
          <div style={{
            width: 80, height: 80, borderRadius: 12, flexShrink: 0,
            background: 'rgba(255,255,255,0.12)',
            border: '2px solid rgba(255,255,255,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1, marginRight: 20,
            backdropFilter: 'blur(4px)',
          }}>
            <Film size={32} style={{ color: 'rgba(255,255,255,0.55)' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
            <h1 style={{ fontSize: 24, color: '#fff', marginBottom: 8, lineHeight: 1.25 }}>
              {movie.primaryTitle}
            </h1>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {genres.map(g => (
                <span key={g} style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 9px',
                  borderRadius: 20, background: 'rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                }}>
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Metadata row */}
        <div style={{
          padding: '14px 28px',
          display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center',
          borderTop: '1px solid var(--border)',
        }}>
          {movie.startYear && (
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{movie.startYear}</span>
          )}
          {movie.runtimeMinutes && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: 'var(--text-secondary)' }}>
              <Clock size={14} /> {movie.runtimeMinutes} min
            </span>
          )}
          {movie.averageRating !== undefined && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: '#fbbf24', fontWeight: 600 }}>
              <Star size={14} fill="currentColor" /> {movie.averageRating.toFixed(1)}
              <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({fmtK(movie.numVotes)} votes)</span>
            </span>
          )}
          {movie.directors && movie.directors.length > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Directed by{' '}
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                {movie.directors.map(d => d.primaryName).join(', ')}
              </span>
            </span>
          )}
          {analytics?.rankings.yearRankByRating && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--accent-light)', fontWeight: 500, marginLeft: 'auto' }}>
              <Award size={14} />
              #{analytics.rankings.yearRankByRating} in {movie.startYear}
            </span>
          )}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          {
            label: 'IMDb Rating',
            value: movie.averageRating?.toFixed(1) ?? '—',
            sub: `${fmtK(movie.numVotes)} votes`,
            icon: <Star size={15} />,
            color: '#fbbf24',
          },
          {
            label: 'Popularity',
            value: movie.popularity?.toFixed(1) ?? '—',
            sub: 'score',
            icon: <TrendingUp size={15} />,
            color: 'var(--info)',
          },
          {
            label: 'Budget',
            value: fmt(movie.budget),
            sub: 'production',
            icon: <DollarSign size={15} />,
            color: 'var(--text-secondary)',
          },
          {
            label: 'Revenue',
            value: fmt(movie.revenue),
            sub: 'box office',
            icon: <DollarSign size={15} />,
            color: 'var(--success)',
          },
          {
            label: 'ROI',
            value: analytics?.financials.roi != null ? `${analytics.financials.roi.toFixed(1)}x` : '—',
            sub: analytics?.financials.roiCategory ?? '',
            icon: <BarChart2 size={15} />,
            color: roiColor(analytics?.financials.roiCategory ?? null),
          },
        ].map(stat => (
          <div key={stat.label} className="stat-box" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <span className="stat-box-label" style={{ margin: 0 }}>{stat.label}</span>
            </div>
            <div className="stat-box-value" style={{ fontSize: 20, color: stat.color }}>{stat.value}</div>
            {stat.sub && <div className="stat-box-sub" style={{ marginTop: 2 }}>{stat.sub}</div>}
          </div>
        ))}
      </div>

      {/* Charts Row 1: Rating Benchmark + Financial Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Rating Benchmark */}
        <div className="chart-container">
          <div className="chart-title">Rating Benchmark</div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: -6, marginBottom: 16 }}>
            How this movie's rating compares to its genre and release year
          </p>
          {ratingBenchmarkData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ratingBenchmarkData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  tickLine={false} axisLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  tickLine={false} axisLine={false} width={28}
                />
                <Tooltip content={<RatingTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                {movie.averageRating && (
                  <ReferenceLine y={movie.averageRating} stroke="var(--accent)" strokeDasharray="4 4" strokeOpacity={0.5} />
                )}
                <Bar dataKey="value" name="Rating" radius={[4, 4, 0, 0]}>
                  <Cell fill="var(--accent)" />
                  <Cell fill="var(--bg-active)" />
                  <Cell fill="var(--bg-active)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No benchmark data available.</p></div>
          )}
        </div>

        {/* Financial Overview */}
        <div className="chart-container">
          <div className="chart-title">Financial Overview</div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: -6, marginBottom: 16 }}>
            Budget, box-office revenue, and net profit
          </p>
          {financialData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={financialData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  tickLine={false} axisLine={false}
                />
                <YAxis
                  tickFormatter={v => fmt(v)}
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickLine={false} axisLine={false} width={64}
                />
                <Tooltip content={<FinancialTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
                  {financialData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No financial data available for this title.</p></div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Runtime Comparison + Rankings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Runtime Comparison */}
        <div className="chart-container">
          <div className="chart-title">Runtime Comparison</div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: -6, marginBottom: 16 }}>
            Movie length vs the average for {primaryGenre || 'this genre'}
          </p>
          {runtimeData.filter(d => d.value > 0).length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={runtimeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  tickLine={false} axisLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  tickLine={false} axisLine={false} width={35}
                  tickFormatter={v => `${v}m`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Runtime: <strong>{payload[0].value} min</strong></div>
                      </div>
                    );
                  }}
                  cursor={{ fill: 'var(--bg-hover)' }}
                />
                <Bar dataKey="value" name="Runtime (min)" radius={[4, 4, 0, 0]}>
                  <Cell fill="var(--warning)" />
                  <Cell fill="var(--bg-active)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No runtime data available.</p></div>
          )}
        </div>

        {/* Rankings & Context */}
        <div className="chart-container">
          <div className="chart-title">Rankings & Context</div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: -6, marginBottom: 16 }}>
            How this movie ranks against peers
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                label: `Year Rank by Rating (${movie.startYear})`,
                value: analytics?.rankings.yearRankByRating ? `#${analytics.rankings.yearRankByRating}` : '—',
                color: 'var(--accent-light)',
              },
              {
                label: 'Genre Year Rank by Revenue',
                value: analytics?.rankings.genreYearRankByRevenue ? `#${analytics.rankings.genreYearRankByRevenue}` : '—',
                color: 'var(--success)',
              },
              {
                label: 'Rating vs Genre Avg',
                value: analytics?.benchmarks.ratingVsGenreAvg != null
                  ? `${analytics.benchmarks.ratingVsGenreAvg >= 0 ? '+' : ''}${analytics.benchmarks.ratingVsGenreAvg.toFixed(1)}`
                  : '—',
                color: (analytics?.benchmarks.ratingVsGenreAvg ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)',
              },
              {
                label: 'Rating vs Year Avg',
                value: analytics?.benchmarks.ratingVsYearAvg != null
                  ? `${analytics.benchmarks.ratingVsYearAvg >= 0 ? '+' : ''}${analytics.benchmarks.ratingVsYearAvg.toFixed(1)}`
                  : '—',
                color: (analytics?.benchmarks.ratingVsYearAvg ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)',
              },
              {
                label: `Total ${primaryGenre || 'Genre'} Movies`,
                value: analytics?.benchmarks.genreAvg?.totalInGenre?.toLocaleString() ?? '—',
                color: 'var(--text-primary)',
              },
            ].map(row => (
              <div
                key={row.label}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{row.label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Genre Peers Chart — full width */}
      {peersChartData.length > 0 && (
        <div className="chart-container" style={{ marginBottom: 20 }}>
          <div className="chart-title">
            {peers?.genre} Peers — {movie.startYear && `${movie.startYear - yearWindow}–${movie.startYear + yearWindow}`}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: -6, marginBottom: 16 }}>
            Top rated {peers?.genre} movies in the same era.{' '}
            <span style={{ color: 'var(--accent-light)' }}>This movie is highlighted.</span>
          </p>
          <ResponsiveContainer width="100%" height={Math.max(300, peersChartData.length * 30 + 40)}>
            <BarChart
              data={peersChartData}
              layout="vertical"
              margin={{ top: 0, right: 70, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 10]}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickLine={false} axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={170}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickLine={false} axisLine={false}
              />
              <Tooltip content={<PeersTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
              <Bar
                dataKey="rating"
                name="Rating"
                radius={[0, 4, 4, 0]}
                label={{
                  position: 'right',
                  fill: 'var(--text-muted)',
                  fontSize: 11,
                  formatter: (v) => (typeof v === 'number' && v > 0) ? v.toFixed(1) : '',
                }}
              >
                {peersChartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isTarget ? 'var(--accent)' : 'var(--bg-active)'}
                    stroke={entry.isTarget ? 'var(--accent-light)' : 'transparent'}
                    strokeWidth={entry.isTarget ? 1 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cast + Similar Movies */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Cast & Crew */}
        <div className="chart-container">
          <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} style={{ color: 'var(--accent)' }} />
            Cast & Crew
          </div>
          {cast.length === 0 ? (
            <div className="empty-state"><Users size={28} /><p>No cast information available.</p></div>
          ) : (
            cast.map(member => (
              <div key={`${member.nconst}-${member.ordering}`} className="person-item">
                <div className="person-avatar">
                  {member.primaryName?.[0]?.toUpperCase() ?? '?'}
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
            ))
          )}
        </div>

        {/* Similar Movies */}
        <div className="chart-container">
          <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Film size={16} style={{ color: 'var(--accent)' }} />
            Similar Movies
          </div>
          {similar.length === 0 ? (
            <div className="empty-state"><Film size={28} /><p>No similar movies available.</p></div>
          ) : (
            similar.map(m => {
              const mGenres = typeof m.genres === 'string'
                ? m.genres.split(',').map(g => g.trim())
                : ((m.genres as unknown as string[]) ?? []);
              return (
                <div
                  key={m.tconst}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  className="card-hover"
                  onClick={() => navigate(`/movies/${m.tconst}`)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                    background: GENRE_GRADIENTS[mGenres[0] ?? ''] ?? 'var(--bg-tertiary)',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.primaryTitle}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {m.startYear} · {mGenres[0]}
                    </div>
                  </div>
                  {m.averageRating !== undefined && (
                    <span style={{ fontSize: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                      <Star size={11} fill="currentColor" /> {m.averageRating.toFixed(1)}
                    </span>
                  )}
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
