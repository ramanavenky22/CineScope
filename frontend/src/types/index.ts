export interface Movie {
  tconst: string;
  primaryTitle: string;
  titleType: string;
  startYear: number;
  endYear?: string;
  runtimeMinutes?: number;
  genres?: string;
  isAdult?: number;
  budget?: number;
  revenue?: number;
  popularity?: number;
  averageRating?: number;
  numVotes?: number;
  originalTitle?: string;
  directors?: Person[];
  writers?: Person[];
  akas?: AKA[];
}

export interface Person {
  nconst: string;
  primaryName: string;
  birthYear?: string | number;
  deathYear?: string;
  primaryProfession?: string | string[];
  knownForTitles?: Movie[];
  filmography?: FilmographyEntry[];
  directed?: Movie[];
}

export interface AKA {
  title: string;
  region: string;
  language: string;
  types: string;
  isOriginalTitle: number;
}

export interface FilmographyEntry {
  tconst: string;
  primaryTitle: string;
  startYear: number;
  genres: string;
  titleType: string;
  averageRating?: number;
  numVotes?: number;
  category: string;
  characters: string;
}

export interface CastMember {
  ordering: number;
  nconst: string;
  category: string;
  job: string;
  characters: string;
  primaryName: string;
  birthYear?: number;
  primaryProfession?: string;
  otherMovies?: Movie[];
}

export interface MovieAnalytics {
  movie: Movie;
  benchmarks: {
    genreAvg: {
      avgRating: number;
      avgRuntime: number;
      avgRevenue: number;
      totalInGenre: number;
    };
    yearAvg: {
      avgRating: number;
      avgPopularity: number;
    };
    ratingVsGenreAvg: number;
    ratingVsYearAvg: number;
    runtimeVsGenreAvg: number;
    revenueVsGenreAvg: number;
  };
  rankings: {
    yearRankByRating: number;
    genreYearRankByRevenue: number;
  };
  financials: {
    budget: number;
    revenue: number;
    profit: number;
    roi: number;
    roiCategory: 'High' | 'Medium' | 'Low' | 'Loss' | null;
  };
}

export interface KPI {
  totalMovies: number;
  avgRating: number;
  avgRuntime: number;
  totalRevenue: number;
  totalBudget: number;
  earliestYear: number;
  latestYear: number;
  topGenre: string;
  topLanguage: string;
  totalVotes: number;
  maxVotes: number;
}

export interface GenreStat {
  genre: string;
  movieCount: number;
  avgRating: number;
  avgRuntime: number;
  totalRevenue: number;
  avgRevenue: number;
  totalVotes: number;
  maxRating: number;
  minRating: number;
}

export interface YearTrend {
  year: number;
  movieCount: number;
  avgRating: number;
  avgRuntime: number;
  totalRevenue: number;
  avgRevenue: number;
  totalVotes: number;
}

export interface RatingAnalytics {
  histogram: { bucket: number; count: number }[];
  byYear: { year: number; avgRating: number; count: number }[];
  byGenre: { genre: string; avgRating: number; count: number }[];
  thresholdStats: { highRated: number; midRated: number; lowRated: number };
}

export interface RuntimeAnalytics {
  stats: { avgRuntime: number; minRuntime: number; maxRuntime: number };
  distribution: { bucketStart: number; count: number }[];
  byGenre: { genre: string; avgRuntime: number; count: number }[];
  vsRating: { runtimeBucket: number; avgRating: number; count: number }[];
}

export interface LanguageAnalytics {
  byLanguage: { language: string; movieCount: number; avgRating: number }[];
  byRegion: { region: string; movieCount: number; avgRating: number }[];
}

export interface TopMovies {
  topRated: Movie[];
  mostVoted: Movie[];
  highestRevenue: Movie[];
  bestROI: (Movie & { roi: number })[];
}

export interface SpotlightItem {
  id: string;
  title: string;
  releaseYear?: number;
  releaseWindow: string;
  genres?: string;
  status: string;
  category: string;
  highlightLabel?: string;
  tagline?: string;
  description?: string;
  linkedTconst?: string | null;
  sortOrder: number;
}

export interface SearchResult {
  query: string;
  movies: SearchMovie[];
  people: SearchPerson[];
}

export interface SearchMovie {
  tconst: string;
  name: string;
  type: string;
  startYear: number;
  genres: string;
  averageRating?: number;
}

export interface SearchPerson {
  id: string;
  name: string;
  type: string;
  primaryProfession: string;
  birthYear?: string;
}

export interface NaturalSearchResult {
  query: string;
  parsedFilters: Record<string, string | number | boolean>;
  insights: string[];
  resultSummary: {
    count: number;
    avgRating: number;
    topGenre: string;
  };
  results: Movie[];
}

export interface MovieListResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  results: Movie[];
}

export interface DirectorStat {
  nconst: string;
  primaryName: string;
  birthYear?: string;
  movieCount: number;
  avgRating: number;
  maxRating: number;
  totalRevenue: number;
}

export interface ActorStat {
  nconst: string;
  primaryName: string;
  birthYear?: string;
  movieCount: number;
  avgRating: number;
  bestRating: number;
  category: string;
}

export interface GenrePeer {
  tconst: string;
  primaryTitle: string;
  startYear: number;
  revenue?: number;
  budget?: number;
  averageRating?: number;
  numVotes?: number;
  isTarget: boolean;
}

export interface GenrePeersResponse {
  tconst: string;
  genre: string | null;
  peers: GenrePeer[];
}

export type Theme = 'dark' | 'light';

export type SortField = 'rating' | 'votes' | 'year' | 'title' | 'revenue' | 'runtime' | 'popularity';

export interface Filters {
  q?: string;
  genre?: string;
  titleType?: string;
  startYear?: number;
  endYear?: number;
  minRating?: number;
  maxRating?: number;
  language?: string;
  region?: string;
  sort?: SortField;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
