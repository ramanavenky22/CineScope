import type {
  Movie, MovieListResponse, MovieAnalytics, CastMember,
  KPI, GenreStat, YearTrend, GenreTrendsResponse, RatingAnalytics, RuntimeAnalytics,
  LanguageAnalytics, TopMovies, DirectorStat, ActorStat,
  Person, SearchResult, NaturalSearchResult, Filters, GenrePeersResponse, SpotlightItem,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function toQuery(params: Record<string, string | number | boolean | undefined>): string {
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (!filtered.length) return '';
  return '?' + filtered.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

export const api = {
  /* ── Health ── */
  health: () =>
    apiFetch<{ status: string; service: string; dbTitles: number }>('/api/health'),

  /* ── Movies ── */
  getMovies: (filters: Filters = {}) =>
    apiFetch<MovieListResponse>(`/api/movies${toQuery(filters as Record<string, string | number | boolean | undefined>)}`),

  getMovie: (id: string) =>
    apiFetch<Movie>(`/api/movies/${id}`),

  getMovieCast: (id: string) =>
    apiFetch<{ tconst: string; cast: CastMember[] }>(`/api/movies/${id}/cast`),

  getMovieSimilar: (id: string, limit = 12) =>
    apiFetch<{ tconst: string; similar: Movie[] }>(`/api/movies/${id}/similar?limit=${limit}`),

  getMovieAnalytics: (id: string) =>
    apiFetch<MovieAnalytics>(`/api/movies/${id}/analytics`),

  getMovieGenrePeers: (id: string, limit = 15, yearWindow = 5) =>
    apiFetch<GenrePeersResponse>(`/api/movies/${id}/genre-peers?limit=${limit}&yearWindow=${yearWindow}`),

  /* ── Analytics ── */
  getKPI: (titleType = 'movie') =>
    apiFetch<KPI>(`/api/analytics/kpi?titleType=${titleType}`),

  getGenres: (titleType = 'movie') =>
    apiFetch<GenreStat[]>(`/api/analytics/genres?titleType=${titleType}`),

  getTrends: (params: { titleType?: string; startYear?: number } = {}) =>
    apiFetch<YearTrend[]>(`/api/analytics/trends${toQuery(params as Record<string, string | number | boolean | undefined>)}`),

  getGenreTrends: (params: { titleType?: string; startYear?: number; topN?: number } = {}) =>
    apiFetch<GenreTrendsResponse>(`/api/analytics/genre-trends${toQuery(params as Record<string, string | number | boolean | undefined>)}`),

  getRatings: (titleType = 'movie') =>
    apiFetch<RatingAnalytics>(`/api/analytics/ratings?titleType=${titleType}`),

  getRuntime: (titleType = 'movie') =>
    apiFetch<RuntimeAnalytics>(`/api/analytics/runtime?titleType=${titleType}`),

  getLanguages: () =>
    apiFetch<LanguageAnalytics>('/api/analytics/languages'),

  getTopMovies: (params: { titleType?: string; limit?: number } = {}) =>
    apiFetch<TopMovies>(`/api/analytics/top-movies${toQuery(params as Record<string, string | number | boolean | undefined>)}`),

  getSpotlights: () =>
    apiFetch<SpotlightItem[]>('/api/analytics/spotlight'),

  getDirectors: (params: { limit?: number; minMovies?: number } = {}) =>
    apiFetch<DirectorStat[]>(`/api/analytics/directors${toQuery(params as Record<string, string | number | boolean | undefined>)}`),

  getActors: (params: { limit?: number; minMovies?: number } = {}) =>
    apiFetch<ActorStat[]>(`/api/analytics/actors${toQuery(params as Record<string, string | number | boolean | undefined>)}`),

  /* ── People ── */
  getPerson: (id: string) =>
    apiFetch<Person>(`/api/people/${id}`),

  /* ── Search ── */
  search: (q: string, limit = 10) =>
    apiFetch<SearchResult>(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  naturalSearch: (query: string, limit = 20) =>
    apiFetch<NaturalSearchResult>('/api/search/natural', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    }),
};
