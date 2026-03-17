import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Search, Sparkles, Sun, Moon, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/movies?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      inputRef.current?.blur();
    }
  };

  // Global shortcut: / to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        <Film size={20} />
        <span>Cine<span className="brand-scope">Scope</span></span>
      </Link>

      {/* Global search */}
      <div className="navbar-search">
        <form onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input
              ref={inputRef}
              className="input"
              placeholder='Search movies, actors… (press /)'
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {query && (
              <button type="button" className="search-input-clear" onClick={() => setQuery('')}>
                <X size={13} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Actions */}
      <div className="navbar-actions">
        <Link to="/search/ai">
          <button className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
            <Sparkles size={14} style={{ color: 'var(--accent-light)' }} />
            AI Search
          </button>
        </Link>

        <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </nav>
  );
}
