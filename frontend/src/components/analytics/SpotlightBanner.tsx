import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clapperboard, TrendingUp } from 'lucide-react';
import type { SpotlightItem } from '../../types';

const AUTO_ROTATE_MS = 1000;

const CATEGORY_LABELS: Record<string, string> = {
  'most-anticipated': 'Most Anticipated',
  'trending-now': 'Trending Now',
  'editor-pick': 'Editor Pick',
};

const GENRE_GRADIENTS: Record<string, string> = {
  Action: 'linear-gradient(135deg, #111827 0%, #1d4ed8 45%, #7c3aed 100%)',
  Thriller: 'linear-gradient(135deg, #0f172a 0%, #1f2937 45%, #475569 100%)',
  Drama: 'linear-gradient(135deg, #312e81 0%, #4338ca 45%, #818cf8 100%)',
  Crime: 'linear-gradient(135deg, #111827 0%, #334155 50%, #475569 100%)',
  Spy: 'linear-gradient(135deg, #172554 0%, #1d4ed8 45%, #60a5fa 100%)',
};

function getGradient(genres?: string) {
  const firstGenre = genres?.split(',')[0]?.trim();
  return GENRE_GRADIENTS[firstGenre || ''] || 'linear-gradient(135deg, #111827 0%, #4338ca 50%, #7c3aed 100%)';
}

function getCategoryLabel(category: string) {
  return CATEGORY_LABELS[category] || category.replace(/-/g, ' ');
}

interface Props {
  items: SpotlightItem[];
}

export function SpotlightBanner({ items }: Props) {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');

  const activeItem = useMemo(
    () => items.find(item => item.id === activeId) ?? items[0],
    [activeId, items]
  );

  const activeIndex = useMemo(
    () => items.findIndex(item => item.id === activeItem?.id),
    [activeItem?.id, items]
  );

  useEffect(() => {
    if (items.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveId(currentId => {
        const currentIndex = items.findIndex(item => item.id === currentId);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % items.length : 0;
        return items[nextIndex]?.id ?? currentId;
      });
    }, AUTO_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [items]);

  if (!activeItem) return null;

  const genres = activeItem.genres?.split(',').map(genre => genre.trim()).filter(Boolean) ?? [];
  const primaryGenre = genres[0];

  return (
    <section
      className="spotlight-banner"
      style={{ background: getGradient(activeItem.genres) }}
    >
      <div className="spotlight-banner-overlay" />

      <div className="spotlight-banner-content">
        <div className="spotlight-copy">
          <div className="spotlight-meta-row">
            <span className="badge badge-warning">{activeItem.status}</span>
            {activeItem.highlightLabel && (
              <span className="badge badge-info">{activeItem.highlightLabel}</span>
            )}
            <span className="spotlight-category">
              <TrendingUp size={13} />
              {getCategoryLabel(activeItem.category)}
            </span>
          </div>

          <div>
            <div className="spotlight-eyebrow">Dashboard Spotlight</div>
            <h2 className="spotlight-title">{activeItem.title}</h2>
            {activeItem.tagline && (
              <p className="spotlight-tagline">{activeItem.tagline}</p>
            )}
            {activeItem.description && (
              <p className="spotlight-description">{activeItem.description}</p>
            )}
          </div>

          <div className="spotlight-stat-row">
            <div className="spotlight-stat">
              <CalendarDays size={14} />
              <span>{activeItem.releaseWindow}</span>
            </div>
            <div className="spotlight-stat">
              <Clapperboard size={14} />
              <span>{genres.slice(0, 2).join(' / ') || 'Featured release'}</span>
            </div>
          </div>

          <div className="spotlight-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                if (activeItem.linkedTconst) navigate(`/movies/${activeItem.linkedTconst}`);
                else if (primaryGenre) navigate(`/movies?genre=${encodeURIComponent(primaryGenre)}`);
                else navigate('/movies');
              }}
            >
              {activeItem.linkedTconst ? 'Open title' : primaryGenre ? `Explore ${primaryGenre}` : 'Explore library'}
              <ArrowRight size={14} />
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => navigate('/movies')}
            >
              Browse Movies
            </button>
          </div>
        </div>

        <div className="spotlight-selector">
          {items.map(item => (
            <button
              key={item.id}
              className={`spotlight-selector-card${item.id === activeItem.id ? ' active' : ''}`}
              onClick={() => setActiveId(item.id)}
            >
              <div className="spotlight-selector-header">
                <span>{item.title}</span>
                <span>{item.releaseYear ?? item.releaseWindow}</span>
              </div>
              <div className="spotlight-selector-subtitle">
                {item.highlightLabel || getCategoryLabel(item.category)}
              </div>
              <div className="spotlight-selector-progress">
                <div
                  className="spotlight-selector-progress-bar"
                  style={{
                    width: item.id === activeItem.id ? '100%' : '0%',
                    transitionDuration: item.id === activeItem.id ? `${AUTO_ROTATE_MS}ms` : '0ms',
                  }}
                  key={`${item.id}-${activeIndex}`}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
