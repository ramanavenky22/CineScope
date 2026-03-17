import { useEffect, useMemo, useState } from 'react';
import type { Movie } from '../types/movie';
import { fetchMovies } from '@services/movieApi';

export type MoviesState = {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  genres: string[];
  yearMin: number;
  yearMax: number;
};

export const useMovies = (): MoviesState => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!active) return;
      try {
        setLoading(true);
        const res = await fetchMovies();
        if (!active) return;
        setMovies(res.movies);
        setError(null);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to load movies');
      }
      if (!active) return;
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const genres = useMemo(() => {
    const set = new Set<string>();
    for (const m of movies) for (const g of m.genres) set.add(g);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [movies]);

  const [yearMin, yearMax] = useMemo(() => {
    if (!movies.length) return [2000, 2025] as const;
    let min = movies[0].year;
    let max = movies[0].year;
    for (const m of movies) {
      if (m.year < min) min = m.year;
      if (m.year > max) max = m.year;
    }
    return [min, max] as const;
  }, [movies]);

  return { movies, loading, error, genres, yearMin, yearMax };
};

