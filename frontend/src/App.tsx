import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CompareProvider } from './contexts/CompareContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { GenreAnalyticsPage } from './pages/GenreAnalyticsPage';
import { TrendsPage } from './pages/TrendsPage';
import { PeopleAnalytics } from './pages/PeopleAnalytics';
import { AISearchPage } from './pages/AISearchPage';
import { SavedPage } from './pages/SavedPage';
import { ComparePage } from './pages/ComparePage';

export default function App() {
  return (
    <ThemeProvider>
      <CompareProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="movies" element={<MoviesPage />} />
              <Route path="movies/:id" element={<MovieDetailPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="analytics/genres" element={<GenreAnalyticsPage />} />
              <Route path="analytics/trends" element={<TrendsPage />} />
              <Route path="analytics/people" element={<PeopleAnalytics />} />
              <Route path="search/ai" element={<AISearchPage />} />
              <Route path="saved" element={<SavedPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CompareProvider>
    </ThemeProvider>
  );
}
