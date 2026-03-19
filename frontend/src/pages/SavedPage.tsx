import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWatchlist } from '../contexts/WatchlistContext';
import { MovieCard } from '../components/movies/MovieCard';

export function SavedPage() {
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22 }}>Watchlist</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 4 }}>
          {watchlist.length > 0
            ? `${watchlist.length} movie${watchlist.length > 1 ? 's' : ''} saved`
            : 'Movies you save will appear here.'}
        </p>
      </div>

      {watchlist.length === 0 ? (
        <div className="empty-state">
          <Heart size={40} />
          <p>Your watchlist is empty.</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Click the heart icon on any movie card to add it here.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/movies')}>
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="movie-grid">
          {watchlist.map(movie => (
            <MovieCard key={movie.tconst} movie={movie} onClick={m => navigate(`/movies/${m.tconst}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
