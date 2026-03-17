import type { Movie } from '../types/movie';
import type { DashboardFilters } from '@context/DashboardContext';

export type AIContext = {
  filters: DashboardFilters;
  selectedMovie: Movie | null;
  visibleMoviesCount: number;
};

export type AIMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

const stableId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export async function askInsights(userText: string, ctx: AIContext): Promise<AIMessage> {
  await new Promise((r) => setTimeout(r, 250));

  const { filters, selectedMovie, visibleMoviesCount } = ctx;
  const parts: string[] = [];

  parts.push(`Here’s what I can infer from your current dashboard context:`);
  parts.push(`- Visible movies: ${visibleMoviesCount}`);
  parts.push(`- Genre filter: ${filters.genres.length ? filters.genres.join(', ') : 'none'}`);
  parts.push(`- Year range: ${filters.yearRange[0]}–${filters.yearRange[1]}`);
  parts.push(`- Search query: ${filters.query ? `"${filters.query}"` : 'none'}`);

  if (selectedMovie) {
    parts.push('');
    parts.push(`Selected movie spotlight:`);
    parts.push(`- ${selectedMovie.title} (${selectedMovie.year}) — rating ${selectedMovie.rating.toFixed(1)}, box office ~$${selectedMovie.boxOfficeMillions}M`);
    parts.push(`- Genres: ${selectedMovie.genres.join(', ')}`);
    parts.push(`- Cast: ${selectedMovie.cast.slice(0, 5).join(', ')}`);
    parts.push('');
    parts.push(
      `Insight idea: compare this movie’s rating vs others in the same genre(s) and year range; look for outliers in box office vs rating.`,
    );
  } else {
    parts.push('');
    parts.push(`Tip: click a movie in the table to get movie-specific insights.`);
  }

  parts.push('');
  parts.push(`You asked: “${userText}”`);
  parts.push(`If you want, ask: “Summarize trends”, “Recommend 3 movies”, or “Why is this movie an outlier?”`);

  return {
    id: stableId(),
    role: 'assistant',
    content: parts.join('\n'),
    createdAt: Date.now()
  };
}

