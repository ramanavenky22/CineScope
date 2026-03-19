import { Star, Clock, TrendingUp, Scale, Heart } from 'lucide-react';
import type { Movie } from '../../types';
import { useCompare } from '../../contexts/CompareContext';
import { useWatchlist } from '../../contexts/WatchlistContext';

const GENRE_GRADIENTS: Record<string, string> = {
  Action:      'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  Adventure:   'linear-gradient(160deg, #134e5e 0%, #2c7a6e 60%, #71b280 100%)',
  Animation:   'linear-gradient(160deg, #4c1d95 0%, #7c3aed 60%, #a78bfa 100%)',
  Comedy:      'linear-gradient(160deg, #831843 0%, #be185d 60%, #ec4899 100%)',
  Crime:       'linear-gradient(160deg, #1c1c1c 0%, #2d2d2d 60%, #404040 100%)',
  Documentary: 'linear-gradient(160deg, #164e63 0%, #0e7490 60%, #06b6d4 100%)',
  Drama:       'linear-gradient(160deg, #312e81 0%, #4338ca 60%, #6366f1 100%)',
  Fantasy:     'linear-gradient(160deg, #4c1d95 0%, #7e22ce 60%, #c084fc 100%)',
  Horror:      'linear-gradient(160deg, #1a0a0a 0%, #450a0a 60%, #7f1d1d 100%)',
  Mystery:     'linear-gradient(160deg, #1e293b 0%, #0f172a 60%, #334155 100%)',
  Romance:     'linear-gradient(160deg, #831843 0%, #9f1239 60%, #e11d48 100%)',
  'Sci-Fi':    'linear-gradient(160deg, #0c1445 0%, #1e3a8a 60%, #1d4ed8 100%)',
  Thriller:    'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #374151 100%)',
  Western:     'linear-gradient(160deg, #451a03 0%, #78350f 60%, #b45309 100%)',
};

function getPosterGradient(genres?: string) {
  const first = genres?.split(',')[0]?.trim();
  return GENRE_GRADIENTS[first || ''] || 'linear-gradient(160deg, #1e2535 0%, #2d3748 100%)';
}

function formatRevenue(n?: number) {
  if (!n) return null;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const genres = movie.genres?.split(',').map(g => g.trim()).slice(0, 2) || [];
  const revenue = formatRevenue(movie.revenue);
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const inCompare = isInCompare(movie.tconst);
  const inWatchlist = isInWatchlist(movie.tconst);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(movie.tconst);
    } else {
      addToWatchlist(movie);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(movie.tconst);
    } else {
      addToCompare(movie);
    }
  };

  return (
    <div className="movie-card" onClick={() => onClick(movie)}>
      {/* Poster */}
      <div
        className="movie-poster"
        style={{ background: getPosterGradient(movie.genres) }}
      >
        {movie.posterUrl && (
          <img
            src={movie.posterUrl}
            alt={movie.primaryTitle}
            className="movie-poster-img"
            loading="lazy"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="movie-poster-overlay" />

        {/* Genre label top-left */}
        {genres[0] && (
          <span
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 2,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              borderRadius: '4px',
              padding: '2px 7px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {genres[0]}
          </span>
        )}

        {/* Year top-right */}
        {movie.startYear && (
          <span
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              borderRadius: '4px',
              padding: '2px 7px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {movie.startYear}
          </span>
        )}

        {/* Watchlist button */}
        <button
          className={`watchlist-btn${inWatchlist ? ' active' : ''}`}
          onClick={handleWatchlistClick}
          title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Heart size={12} fill={inWatchlist ? 'currentColor' : 'none'} />
        </button>

        {/* Compare button */}
        <button
          className={`compare-btn${inCompare ? ' active' : ''}`}
          onClick={handleCompareClick}
          title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
        >
          <Scale size={12} />
        </button>

        {/* Rating badge */}
        {movie.averageRating !== undefined && (
          <div className="movie-rating-badge">
            <Star size={11} fill="currentColor" />
            {movie.averageRating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="movie-card-body">
        <div className="movie-title">{movie.primaryTitle}</div>

        <div className="movie-meta">
          {movie.runtimeMinutes && (
            <span className="movie-meta-item">
              <Clock size={11} />
              {movie.runtimeMinutes}m
            </span>
          )}
          {movie.numVotes !== undefined && (
            <span className="movie-meta-item">
              <TrendingUp size={11} />
              {movie.numVotes >= 1000
                ? `${(movie.numVotes / 1000).toFixed(0)}K`
                : movie.numVotes}
            </span>
          )}
          {revenue && (
            <span className="movie-meta-item" style={{ color: 'var(--success)', fontSize: 11 }}>
              {revenue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
