import { useState } from 'react';
import { AISearchPanel } from '../components/search/AISearchPanel';
import { MovieDrawer } from '../components/movies/MovieDrawer';
import type { Movie } from '../types';

export function AISearchPage() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  return (
    <div>
      <AISearchPanel onSelectMovie={setSelectedMovie} />

      {selectedMovie && (
        <MovieDrawer
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onSelectMovie={setSelectedMovie}
        />
      )}
    </div>
  );
}
