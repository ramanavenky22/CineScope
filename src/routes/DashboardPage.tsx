import { Box, Button, Grid, Paper, Typography, Alert, CircularProgress } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useMovies } from '@hooks/useMovies';
import { DashboardProvider, useDashboard } from '@context/DashboardContext';
import { SearchBar } from '@components/filters/SearchBar';
import { GenreFilter } from '@components/filters/GenreFilter';
import { YearRangeSlider } from '@components/filters/YearRangeSlider';
import { MoviesTable } from '@components/movies/MoviesTable';
import { AIChatPanel } from '@components/ai/AIChatPanel';
import { ChartCard } from '@components/charts/ChartCard';
import { RatingHistogram } from '@components/charts/RatingHistogram';
import { GenrePopularityChart } from '@components/charts/GenrePopularityChart';
import { BoxOfficeVsRatingScatter } from '@components/charts/BoxOfficeVsRatingScatter';
import { ReleaseTimeline } from '@components/charts/ReleaseTimeline';
import type { Movie } from '../types/movie';
import React from 'react';

const applyFilters = (movies: Movie[], filters: { query: string; genres: string[]; yearRange: [number, number] }) => {
  const q = filters.query.trim().toLowerCase();
  const [y0, y1] = filters.yearRange;
  return movies.filter((m) => {
    if (m.year < y0 || m.year > y1) return false;
    if (filters.genres.length && !filters.genres.some((g) => m.genres.includes(g))) return false;
    if (!q) return true;
    const inTitle = m.title.toLowerCase().includes(q);
    const inCast = m.cast.some((a) => a.toLowerCase().includes(q));
    return inTitle || inCast;
  });
};

const DashboardInner = ({
  movies,
  genres,
  yearMin,
  yearMax
}: {
  movies: Movie[];
  genres: string[];
  yearMin: number;
  yearMax: number;
}) => {
  const { filters, setQuery, setGenres, setYearRange, clearFilters, selectedMovieId, setSelectedMovieId } = useDashboard();
  const filteredMovies = React.useMemo(() => applyFilters(movies, filters), [movies, filters]);
  const selectedMovie = React.useMemo(
    () => (selectedMovieId ? movies.find((m) => m.id === selectedMovieId) ?? null : null),
    [movies, selectedMovieId]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Movie Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search, filter, and explore your dataset. Charts and the AI insights panel react to the same shared filters.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <SearchBar value={filters.query} onChange={setQuery} />
          </Grid>
          <Grid item xs={12} md={4}>
            <GenreFilter value={filters.genres} options={genres} onChange={setGenres} />
          </Grid>
          <Grid item xs={12} md={2.5}>
            <YearRangeSlider value={filters.yearRange} min={yearMin} max={yearMax} onChange={setYearRange} />
          </Grid>
          <Grid item xs={12} md={0.5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              onClick={clearFilters}
              variant="text"
              startIcon={<RestartAltIcon />}
              aria-label="Clear filters"
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartCard title="Rating distribution" subtitle="Histogram of ratings (0–10)">
                <RatingHistogram movies={filteredMovies} />
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard title="Genre popularity" subtitle="Count of visible movies per genre">
                <GenrePopularityChart movies={filteredMovies} />
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard title="Box office vs rating" subtitle="How popularity compares to reception">
                <BoxOfficeVsRatingScatter movies={filteredMovies} />
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard title="Release timeline" subtitle="Visible movies over time">
                <ReleaseTimeline movies={filteredMovies} />
              </ChartCard>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={4}>
          <AIChatPanel filters={filters} selectedMovie={selectedMovie} visibleMoviesCount={filteredMovies.length} />
        </Grid>
        <Grid item xs={12}>
          <MoviesTable
            movies={filteredMovies}
            selectedMovieId={selectedMovieId}
            onSelectMovie={(id) => setSelectedMovieId(id)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export const DashboardPage = () => {
  const { movies, loading, error, genres, yearMin, yearMax } = useMovies();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography color="text.secondary">Loading movies…</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <DashboardProvider initialYearRange={[yearMin, yearMax]}>
      <DashboardInner movies={movies} genres={genres} yearMin={yearMin} yearMax={yearMax} />
    </DashboardProvider>
  );
};

