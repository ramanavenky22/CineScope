import { Film, Star, TrendingUp } from 'lucide-react';
import type { Movie } from '../../types';

interface Props {
  total: number;
  movies: Movie[];
}

export function ResultsSummary({ total, movies }: Props) {
  const rated = movies.filter(m => m.averageRating !== undefined);
  const avgRating = rated.length
    ? (rated.reduce((s, m) => s + (m.averageRating ?? 0), 0) / rated.length).toFixed(1)
    : null;

  const genreCounts: Record<string, number> = {};
  for (const m of movies) {
    for (const g of (m.genres || '').split(',').map(s => s.trim()).filter(Boolean)) {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    }
  }
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="results-summary">
      <div className="results-summary-stat">
        <Film size={13} style={{ color: 'var(--accent)' }} />
        <strong>{total.toLocaleString()}</strong> movies found
      </div>

      {avgRating && (
        <>
          <div className="results-divider" />
          <div className="results-summary-stat">
            <Star size={13} style={{ color: '#fbbf24' }} />
            Avg rating: <strong>{avgRating}</strong>
          </div>
        </>
      )}

      {topGenre && (
        <>
          <div className="results-divider" />
          <div className="results-summary-stat">
            <TrendingUp size={13} style={{ color: 'var(--info)' }} />
            Top genre: <strong>{topGenre}</strong>
          </div>
        </>
      )}
    </div>
  );
}
