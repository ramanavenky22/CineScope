import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { api } from '../api/client';
import { MovieCard } from '../components/movies/MovieCard';
import { MovieDrawer } from '../components/movies/MovieDrawer';
import { ResultsSummary } from '../components/movies/ResultsSummary';
import type { Movie, MovieListResponse, Filters, SortField } from '../types';

const GENRES = ['Action','Adventure','Animation','Comedy','Crime','Documentary','Drama',
  'Fantasy','Horror','Mystery','Romance','Sci-Fi','Thriller','Western','Biography','Music','Sport'];

const YEARS = Array.from({ length: 30 }, (_, i) => 2025 - i);

export function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<MovieListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters from URL
  const filters: Filters = {
    q:         searchParams.get('q') || undefined,
    genre:     searchParams.get('genre') || undefined,
    titleType: searchParams.get('titleType') || 'movie',
    startYear: searchParams.get('startYear') ? Number(searchParams.get('startYear')) : undefined,
    endYear:   searchParams.get('endYear') ? Number(searchParams.get('endYear')) : undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    sort:      (searchParams.get('sort') as SortField) || 'rating',
    order:     (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    page:      searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit:     24,
  };

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMovies(filters);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  function updateParam(key: string, value: string | number | undefined) {
    const params = new URLSearchParams(searchParams);
    if (value === undefined || value === '' || value === 'movie') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  }

  const currentPage = filters.page || 1;
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22 }}>Movies</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 4 }}>
            Browse, search, and filter the movie database.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn-icon${viewMode === 'grid' ? '' : ''}`}
            onClick={() => setViewMode('grid')}
            style={{ color: viewMode === 'grid' ? 'var(--accent)' : undefined }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className="btn-icon"
            onClick={() => setViewMode('list')}
            style={{ color: viewMode === 'list' ? 'var(--accent)' : undefined }}
          >
            <List size={16} />
          </button>
          <button
            className={`btn btn-ghost btn-sm`}
            onClick={() => setShowFilters(f => !f)}
            style={{ borderColor: showFilters ? 'var(--accent-border)' : undefined }}
          >
            <SlidersHorizontal size={13} /> Filters
          </button>
        </div>
      </div>

      {/* Quick search bar */}
      <div style={{ marginBottom: 16 }}>
        <div className="search-input-wrap">
          <input
            className="input"
            placeholder="Search by title…"
            value={searchParams.get('q') || ''}
            onChange={e => updateParam('q', e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            <div className="filter-group">
              <label className="filter-label">Genre</label>
              <select className="input" value={filters.genre || ''} onChange={e => updateParam('genre', e.target.value)}>
                <option value="">All Genres</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">From Year</label>
              <select className="input" value={filters.startYear || ''} onChange={e => updateParam('startYear', e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">Any</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">To Year</label>
              <select className="input" value={filters.endYear || ''} onChange={e => updateParam('endYear', e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">Any</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Min Rating</label>
              <select className="input" value={filters.minRating || ''} onChange={e => updateParam('minRating', e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">Any</option>
                {[5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map(r => <option key={r} value={r}>{r}+</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Type</label>
              <select className="input" value={filters.titleType || 'movie'} onChange={e => updateParam('titleType', e.target.value)}>
                <option value="movie">Movie</option>
                <option value="tvSeries">TV Series</option>
                <option value="short">Short</option>
                <option value="tvMovie">TV Movie</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select className="input" value={filters.sort || 'rating'} onChange={e => updateParam('sort', e.target.value)}>
                {['rating','votes','year','title','revenue','runtime','popularity'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Order</label>
              <select className="input" value={filters.order || 'desc'} onChange={e => updateParam('order', e.target.value)}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div className="error-banner">{error}</div>}

      {/* Results summary */}
      {data && !loading && (
        <ResultsSummary total={data.total} movies={data.results} />
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      )}

      {/* Grid */}
      {!loading && data && data.results.length > 0 && (
        viewMode === 'grid' ? (
          <div className="movie-grid">
            {data.results.map(movie => (
              <MovieCard key={movie.tconst} movie={movie} onClick={setSelectedMovie} />
            ))}
          </div>
        ) : (
          <div className="chart-container" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Year</th>
                  <th>Genre</th>
                  <th>Rating</th>
                  <th>Runtime</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map(m => (
                  <tr key={m.tconst} style={{ cursor: 'pointer' }} onClick={() => setSelectedMovie(m)}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.primaryTitle}</td>
                    <td>{m.startYear}</td>
                    <td>{m.genres?.split(',')[0]}</td>
                    <td style={{ color: '#fbbf24' }}>{m.averageRating?.toFixed(1) ?? '—'}</td>
                    <td>{m.runtimeMinutes ? `${m.runtimeMinutes}m` : '—'}</td>
                    <td style={{ color: 'var(--success)' }}>
                      {m.revenue ? (m.revenue >= 1e6 ? `$${(m.revenue/1e6).toFixed(0)}M` : `$${m.revenue}`) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Empty */}
      {!loading && data?.results.length === 0 && (
        <div className="empty-state">
          <p>No movies found. Try adjusting the filters.</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1}>
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let page: number;
            if (totalPages <= 7) {
              page = i + 1;
            } else if (currentPage <= 4) {
              page = i + 1;
            } else if (currentPage >= totalPages - 3) {
              page = totalPages - 6 + i;
            } else {
              page = currentPage - 3 + i;
            }
            return (
              <button
                key={page}
                className={`page-btn${page === currentPage ? ' active' : ''}`}
                onClick={() => setPage(page)}
              >
                {page}
              </button>
            );
          })}

          <button className="page-btn" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Drawer */}
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
