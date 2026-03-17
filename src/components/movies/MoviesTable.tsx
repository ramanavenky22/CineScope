import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from '@mui/material';
import React from 'react';
import type { Movie } from '../../types/movie';

type Order = 'asc' | 'desc';

type SortKey = 'title' | 'year' | 'rating' | 'boxOfficeMillions';

type MoviesTableProps = {
  movies: Movie[];
  selectedMovieId: string | null;
  onSelectMovie: (movieId: string) => void;
};

export const MoviesTable = ({ movies, selectedMovieId, onSelectMovie }: MoviesTableProps) => {
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<SortKey>('rating');

  const handleSort = (key: SortKey) => {
    setOrder((prev) => (orderBy === key ? (prev === 'asc' ? 'desc' : 'asc') : 'desc'));
    setOrderBy(key);
  };

  const sorted = React.useMemo(() => {
    const copy = [...movies];
    copy.sort((a, b) => {
      const dir = order === 'asc' ? 1 : -1;
      const av = a[orderBy];
      const bv = b[orderBy];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return copy;
  }, [movies, order, orderBy]);

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Movies
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Click a row to select a movie (used by the details modal and AI insights).
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 420 }}>
        <Table stickyHeader size="small" aria-label="Movies table">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'title' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'title'}
                  direction={orderBy === 'title' ? order : 'asc'}
                  onClick={() => handleSort('title')}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sortDirection={orderBy === 'year' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'year'}
                  direction={orderBy === 'year' ? order : 'asc'}
                  onClick={() => handleSort('year')}
                >
                  Year
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sortDirection={orderBy === 'rating' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'rating'}
                  direction={orderBy === 'rating' ? order : 'asc'}
                  onClick={() => handleSort('rating')}
                >
                  Rating
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sortDirection={orderBy === 'boxOfficeMillions' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'boxOfficeMillions'}
                  direction={orderBy === 'boxOfficeMillions' ? order : 'asc'}
                  onClick={() => handleSort('boxOfficeMillions')}
                >
                  Box office ($M)
                </TableSortLabel>
              </TableCell>
              <TableCell>Genres</TableCell>
              <TableCell>Cast</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((m) => {
              const selected = m.id === selectedMovieId;
              return (
                <TableRow
                  key={m.id}
                  hover
                  selected={selected}
                  onClick={() => onSelectMovie(m.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell component="th" scope="row">
                    {m.title}
                  </TableCell>
                  <TableCell align="right">{m.year}</TableCell>
                  <TableCell align="right">{m.rating.toFixed(1)}</TableCell>
                  <TableCell align="right">{m.boxOfficeMillions.toLocaleString()}</TableCell>
                  <TableCell>{m.genres.join(', ')}</TableCell>
                  <TableCell>{m.cast.slice(0, 3).join(', ')}{m.cast.length > 3 ? '…' : ''}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

