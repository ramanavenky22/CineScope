import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import type { Movie } from '../../types/movie';

type ReleaseTimelineProps = {
  movies: Movie[];
};

type YearDatum = {
  year: number;
  count: number;
};

const buildTimeline = (movies: Movie[]): YearDatum[] => {
  const map = new Map<number, number>();
  for (const m of movies) map.set(m.year, (map.get(m.year) ?? 0) + 1);
  return [...map.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);
};

export const ReleaseTimeline = ({ movies }: ReleaseTimelineProps) => {
  const data = buildTimeline(movies);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="year" tickMargin={8} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

