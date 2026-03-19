import { Outlet, useNavigate } from 'react-router-dom';
import { X, Scale } from 'lucide-react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useCompare } from '../../contexts/CompareContext';

export function Layout() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className="compare-bar">
          <div className="compare-bar-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
              <Scale size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0 }}>
                {compareList.length}/3 selected
              </span>
              <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 0 }}>
                {compareList.map(m => (
                  <div key={m.tconst} className="compare-bar-chip">
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.primaryTitle}
                    </span>
                    <button
                      onClick={() => removeFromCompare(m.tconst)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button className="btn btn-ghost btn-sm" onClick={clearCompare}>Clear</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/compare')}
                disabled={compareList.length < 2}
              >
                Compare Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
