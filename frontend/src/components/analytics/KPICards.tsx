import { Film, Star, Clock, DollarSign, Clapperboard, Globe } from 'lucide-react';
import type { KPI } from '../../types';

function fmt(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return n.toLocaleString();
}

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}

function KPICard({ label, value, sub, icon, color }: KPICardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

interface Props {
  kpi: KPI;
}

export function KPICards({ kpi }: Props) {
  return (
    <div className="kpi-grid">
      <KPICard
        label="Total Movies"
        value={kpi.totalMovies.toLocaleString()}
        sub={`${kpi.earliestYear} – ${kpi.latestYear}`}
        icon={<Film size={18} />}
        color="var(--accent)"
      />
      <KPICard
        label="Avg Rating"
        value={kpi.avgRating.toFixed(2)}
        sub="out of 10"
        icon={<Star size={18} />}
        color="#fbbf24"
      />
      <KPICard
        label="Total Revenue"
        value={fmt(kpi.totalRevenue)}
        sub="box office"
        icon={<DollarSign size={18} />}
        color="var(--success)"
      />
      <KPICard
        label="Avg Runtime"
        value={`${kpi.avgRuntime}m`}
        sub="per movie"
        icon={<Clock size={18} />}
        color="var(--info)"
      />
      <KPICard
        label="Top Genre"
        value={kpi.topGenre}
        sub="most titles"
        icon={<Clapperboard size={18} />}
        color="var(--warning)"
      />
      <KPICard
        label="Top Language"
        value={kpi.topLanguage.toUpperCase()}
        sub={`${(kpi.totalVotes / 1e6).toFixed(1)}M total votes`}
        icon={<Globe size={18} />}
        color="#a78bfa"
      />
    </div>
  );
}
