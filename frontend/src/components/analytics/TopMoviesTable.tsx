import { Star, TrendingUp, DollarSign, Award } from 'lucide-react';
import type { Movie, TopMovies } from '../../types';

function fmt(n?: number) {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

interface RowProps {
  rank: number;
  movie: Movie & { roi?: number };
  mode: 'rating' | 'votes' | 'revenue' | 'roi';
  onClick: (m: Movie) => void;
}

function Row({ rank, movie, mode, onClick }: RowProps) {
  const metricEl = {
    rating:  <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}><Star size={12} fill="currentColor" />{movie.averageRating?.toFixed(1) ?? '—'}</span>,
    votes:   <span style={{ color: 'var(--info)', display: 'flex', alignItems: 'center', gap: 3 }}><TrendingUp size={12} />{movie.numVotes ? `${(movie.numVotes / 1000).toFixed(0)}K` : '—'}</span>,
    revenue: <span style={{ color: 'var(--success)', fontWeight: 600 }}>{fmt(movie.revenue)}</span>,
    roi:     <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{movie.roi != null ? `${(movie.roi as number).toFixed(2)}x` : '—'}</span>,
  }[mode];

  return (
    <tr
      style={{ cursor: 'pointer' }}
      onClick={() => onClick(movie)}
    >
      <td className="rank-num" style={{ color: rank <= 3 ? 'var(--accent-light)' : 'var(--text-muted)', fontWeight: 700 }}>
        {rank}
      </td>
      <td>
        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 13 }}>
          {movie.primaryTitle}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
          {movie.startYear} · {movie.genres?.split(',')[0]}
        </div>
      </td>
      <td style={{ textAlign: 'right' }}>{metricEl}</td>
    </tr>
  );
}

interface Props {
  data: TopMovies;
  activeTab: 'topRated' | 'mostVoted' | 'highestRevenue' | 'bestROI';
  onSelectMovie: (m: Movie) => void;
}

const TABS: { key: Props['activeTab']; label: string; icon: React.ReactNode; mode: RowProps['mode'] }[] = [
  { key: 'topRated',       label: 'Top Rated',      icon: <Star size={13} />,        mode: 'rating' },
  { key: 'mostVoted',      label: 'Most Voted',     icon: <TrendingUp size={13} />,  mode: 'votes' },
  { key: 'highestRevenue', label: 'Box Office',     icon: <DollarSign size={13} />,  mode: 'revenue' },
  { key: 'bestROI',        label: 'Best ROI',       icon: <Award size={13} />,       mode: 'roi' },
];

export function TopMoviesTable({ data, activeTab, onSelectMovie }: Props) {
  const tabConfig = TABS.find(t => t.key === activeTab)!;
  const movies = (data[activeTab] as (Movie & { roi?: number })[]) || [];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 36 }}>#</th>
            <th>Title</th>
            <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {tabConfig.icon} {tabConfig.label}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {movies.slice(0, 20).map((m, i) => (
            <Row
              key={m.tconst}
              rank={i + 1}
              movie={m}
              mode={tabConfig.mode}
              onClick={onSelectMovie}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { TABS };
