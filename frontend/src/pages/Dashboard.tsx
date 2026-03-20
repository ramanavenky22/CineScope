import { useEffect, useState } from 'react';
import { Star, TrendingUp, DollarSign } from 'lucide-react';
import { api } from '../api/client';
import { KPICards } from '../components/analytics/KPICards';
import { SpotlightBanner } from '../components/analytics/SpotlightBanner';
import { GenreChart } from '../components/analytics/GenreChart';
import { TrendsChart } from '../components/analytics/TrendsChart';
import { TopMoviesTable, TABS } from '../components/analytics/TopMoviesTable';
import { MovieDrawer } from '../components/movies/MovieDrawer';
import type { KPI, GenreStat, YearTrend, TopMovies, Movie, SpotlightItem } from '../types';

type TopTab = 'topRated' | 'mostVoted' | 'highestRevenue' | 'bestROI';

export function Dashboard() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [genres, setGenres] = useState<GenreStat[]>([]);
  const [trends, setTrends] = useState<YearTrend[]>([]);
  const [topMovies, setTopMovies] = useState<TopMovies | null>(null);
  const [spotlights, setSpotlights] = useState<SpotlightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [genreMetric, setGenreMetric] = useState<'movieCount' | 'avgRating' | 'totalRevenue'>('movieCount');
  const [trendMetric, setTrendMetric] = useState<'movieCount' | 'avgRating' | 'totalRevenue'>('movieCount');
  const [topTab, setTopTab] = useState<TopTab>('topRated');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    Promise.allSettled([
      api.getSpotlights(),
      api.getKPI(),
      api.getGenres(),
      api.getTrends(),
      api.getTopMovies({ limit: 50 }),
    ]).then(([spotlightR, kpiR, genresR, trendsR, topR]) => {
      if (spotlightR.status === 'fulfilled') setSpotlights(spotlightR.value);
      if (kpiR.status === 'fulfilled') setKpi(kpiR.value);
      if (genresR.status === 'fulfilled') setGenres(genresR.value);
      if (trendsR.status === 'fulfilled') setTrends(trendsR.value);
      if (topR.status === 'fulfilled') setTopMovies(topR.value);
      if (kpiR.status === 'rejected') setError('Failed to load dashboard data');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  if (error) {
    return <div className="error-banner">{error}. Make sure the backend is running on port 3001.</div>;
  }

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 4 }}>
          Global analytics overview for all movies in the database.
        </p>
      </div>

      {spotlights.length > 0 && <SpotlightBanner items={spotlights} />}

      {/* KPI Cards */}
      {kpi && <KPICards kpi={kpi} />}

      {/* Genre + Trends row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Genre chart */}
        <div className="chart-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="chart-title" style={{ margin: 0 }}>Genre Breakdown</div>
            <div className="tab-bar">
              {(['movieCount', 'avgRating', 'totalRevenue'] as const).map(m => (
                <button
                  key={m}
                  className={`tab-btn${genreMetric === m ? ' active' : ''}`}
                  onClick={() => setGenreMetric(m)}
                >
                  {m === 'movieCount' ? 'Count' : m === 'avgRating' ? 'Rating' : 'Revenue'}
                </button>
              ))}
            </div>
          </div>
          {genres.length > 0 ? (
            <GenreChart data={genres} metric={genreMetric} />
          ) : (
            <div className="empty-state">No genre data</div>
          )}
        </div>

        {/* Year trends */}
        <div className="chart-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="chart-title" style={{ margin: 0 }}>Year Trends</div>
            <div className="tab-bar">
              {([
                { key: 'movieCount', label: 'Count', icon: <TrendingUp size={11} /> },
                { key: 'avgRating',  label: 'Rating', icon: <Star size={11} /> },
                { key: 'totalRevenue', label: 'Revenue', icon: <DollarSign size={11} /> },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  className={`tab-btn${trendMetric === key ? ' active' : ''}`}
                  onClick={() => setTrendMetric(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {trends.length > 0 ? (
            <TrendsChart data={trends} metric={trendMetric} />
          ) : (
            <div className="empty-state">No trend data</div>
          )}
        </div>
      </div>

      {/* Top Movies */}
      {topMovies && (
        <div className="chart-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="chart-title" style={{ margin: 0 }}>Leaderboards</div>
            <div className="tab-bar">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`tab-btn${topTab === t.key ? ' active' : ''}`}
                  onClick={() => setTopTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <TopMoviesTable
            data={topMovies}
            activeTab={topTab}
            onSelectMovie={setSelectedMovie}
          />
        </div>
      )}

      {/* Movie drawer */}
      {selectedMovie && (
        <MovieDrawer
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onSelectMovie={setSelectedMovie}
        />
      )}
    </div>
  );
}
