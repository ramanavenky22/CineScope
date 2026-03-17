import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { Movie } from '../../types/movie';

type RatingHistogramProps = {
  movies: Movie[];
};

type Bin = {
  bin: string;
  count: number;
};

const buildBins = (movies: Movie[]): Bin[] => {
  const bins = Array.from({ length: 10 }, (_, i) => ({
    bin: `${i}–${i + 1}`,
    count: 0
  }));
  for (const m of movies) {
    const idx = Math.min(9, Math.max(0, Math.floor(m.rating)));
    bins[idx].count += 1;
  }
  return bins;
};

export const RatingHistogram = ({ movies }: RatingHistogramProps) => {
  const data = buildBins(movies);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="bin" tickMargin={8} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#ff6b81" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

