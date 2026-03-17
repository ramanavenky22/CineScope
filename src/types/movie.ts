export type Movie = {
  id: string;
  title: string;
  year: number;
  releaseDate: string; // ISO date
  genres: string[];
  rating: number; // 0..10
  boxOfficeMillions: number;
  cast: string[];
  overview: string;
  posterUrl?: string;
};

