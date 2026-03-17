import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import type { Movie } from '../../types/movie';

type BoxOfficeVsRatingScatterProps = {
  movies: Movie[];
};

type Point = {
  title: string;
  rating: number;
  boxOfficeMillions: number;
};

export const BoxOfficeVsRatingScatter = ({ movies }: BoxOfficeVsRatingScatterProps) => {
  const data: Point[] = movies.map((m) => ({
    title: m.title,
    rating: m.rating,
    boxOfficeMillions: m.boxOfficeMillions
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis type="number" dataKey="rating" domain={[0, 10]} tickCount={6} name="Rating" />
        <YAxis
          type="number"
          dataKey="boxOfficeMillions"
          name="Box office ($M)"
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          formatter={(value, name) => [value, name === 'boxOfficeMillions' ? 'Box office ($M)' : 'Rating']}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.title ?? ''}
        />
        <Scatter data={data} fill="#ffb020" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

