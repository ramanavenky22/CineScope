import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Movie } from '../types';

interface CompareContextType {
  compareList: Movie[];
  addToCompare: (movie: Movie) => void;
  removeFromCompare: (tconst: string) => void;
  clearCompare: () => void;
  isInCompare: (tconst: string) => boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Movie[]>([]);

  const addToCompare = (movie: Movie) => {
    setCompareList(prev => {
      if (prev.length >= 3 || prev.some(m => m.tconst === movie.tconst)) return prev;
      return [...prev, movie];
    });
  };

  const removeFromCompare = (tconst: string) => {
    setCompareList(prev => prev.filter(m => m.tconst !== tconst));
  };

  const clearCompare = () => setCompareList([]);

  const isInCompare = (tconst: string) => compareList.some(m => m.tconst === tconst);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be inside CompareProvider');
  return ctx;
}
