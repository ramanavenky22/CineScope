import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Movie } from '../types';

interface WatchlistContextType {
  watchlist: Movie[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (tconst: string) => void;
  isInWatchlist: (tconst: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<Movie[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cinescope_watchlist') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cinescope_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (movie: Movie) => {
    setWatchlist(prev => prev.some(m => m.tconst === movie.tconst) ? prev : [...prev, movie]);
  };

  const removeFromWatchlist = (tconst: string) => {
    setWatchlist(prev => prev.filter(m => m.tconst !== tconst));
  };

  const isInWatchlist = (tconst: string) => watchlist.some(m => m.tconst === tconst);

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be inside WatchlistProvider');
  return ctx;
}
