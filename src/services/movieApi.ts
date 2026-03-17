import type { Movie } from '../types/movie';

type MoviesResponse = {
  movies: Movie[];
};

export async function fetchMovies(): Promise<MoviesResponse> {
  const res = await fetch('/api/movies');
  if (!res.ok) {
    throw new Error(`Failed to load movies (status ${res.status})`);
  }
  const data = (await res.json()) as { movies: Movie[] };
  return {
    movies: data.movies.map((m) => ({
      ...m,
      posterUrl: m.posterUrl || undefined
    }))
  };
}

