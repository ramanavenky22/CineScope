import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Film, BarChart2, TrendingUp,
  Users, Sparkles, Bookmark,
} from 'lucide-react';

interface NavEntry {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NAV_ITEMS: NavEntry[] = [
  { to: '/',              icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { to: '/movies',        icon: <Film size={16} />,            label: 'Movies' },
  { to: '/analytics/genres', icon: <BarChart2 size={16} />,   label: 'Genre Analytics' },
  { to: '/analytics/trends', icon: <TrendingUp size={16} />,  label: 'Trends' },
  { to: '/analytics/people', icon: <Users size={16} />,       label: 'Directors & Actors' },
];

const AI_ITEMS: NavEntry[] = [
  { to: '/search/ai',    icon: <Sparkles size={16} />,         label: 'AI Search' },
  { to: '/saved',        icon: <Bookmark size={16} />,         label: 'Saved Queries' },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <span className="sidebar-section-title">Navigate</span>

      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}

      <span className="sidebar-section-title" style={{ marginTop: 8 }}>Discovery</span>

      {AI_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}
