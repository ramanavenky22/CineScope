import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import type { Movie } from '../../types/movie';

type GenrePopularityChartProps = {
  movies: Movie[];
};

type GenreDatum = {
  genre: string;
  count: number;
};

const buildGenreCounts = (movies: Movie[]): GenreDatum[] => {
  const map = new Map<string, number>();
  for (const m of movies) {
    for (const g of m.genres) map.set(g, (map.get(g) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre));
};

export const GenrePopularityChart = ({ movies }: GenrePopularityChartProps) => {
  const data = buildGenreCounts(movies);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, left: 24, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="genre" width={90} />
        <Tooltip />
        <Bar dataKey="count" fill="#3f51b5" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

