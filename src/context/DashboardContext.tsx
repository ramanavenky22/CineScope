import React, { createContext, useContext, useMemo, useState } from 'react';

export type DashboardFilters = {
  query: string;
  genres: string[];
  yearRange: [number, number];
};

export type DashboardState = {
  filters: DashboardFilters;
  setQuery: (query: string) => void;
  setGenres: (genres: string[]) => void;
  setYearRange: (range: [number, number]) => void;
  clearFilters: () => void;
  selectedMovieId: string | null;
  setSelectedMovieId: (id: string | null) => void;
};

const DashboardContext = createContext<DashboardState | undefined>(undefined);

type DashboardProviderProps = {
  children: React.ReactNode;
  initialYearRange: [number, number];
};

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children, initialYearRange }) => {
  const [query, setQuery] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>(initialYearRange);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const value = useMemo<DashboardState>(
    () => ({
      filters: { query, genres, yearRange },
      setQuery,
      setGenres,
      setYearRange,
      clearFilters: () => {
        setQuery('');
        setGenres([]);
        setYearRange(initialYearRange);
        setSelectedMovieId(null);
      },
      selectedMovieId,
      setSelectedMovieId
    }),
    [query, genres, yearRange, selectedMovieId, initialYearRange]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = (): DashboardState => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
};

