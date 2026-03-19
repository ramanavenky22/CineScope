import { useState } from 'react';
import { Sparkles, Send, Code2, Filter } from 'lucide-react';
import { api } from '../../api/client';
import { MovieCard } from '../movies/MovieCard';
import { ResultsSummary } from '../movies/ResultsSummary';
import type { NaturalSearchResult, Movie } from '../../types';

const EXAMPLES = [
  'sci-fi movies after 2015 with rating above 7.5',
  'top action movies directed by Nolan',
  'highest grossing comedies in the 2010s',
  'drama movies with rating above 8',
  'most voted thriller movies',
  'recent horror films with high ratings',
];

interface Props {
  onSelectMovie?: (movie: Movie) => void;
}

export function AISearchPanel({ onSelectMovie }: Props) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<NaturalSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  const handleSearch = async (q = query) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.naturalSearch(trimmed, 24);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 style={{ fontSize: 24, margin: 0 }}>AI Search</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Describe what you're looking for in natural language
        </p>
      </div>

      <div className="ai-search-container">
        {/* Input */}
        <div className="ai-search-input-wrap">
          <textarea
            className="ai-search-input"
            rows={2}
            placeholder="e.g. sci-fi movies after 2015 with rating above 7.5…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ paddingRight: 100 }}
          />
          <button
            className="ai-submit-btn"
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
            ) : (
              <Send size={13} />
            )}
            Search
          </button>
        </div>

        {/* Example chips */}
        {!result && !loading && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Try an example:
            </div>
            <div className="ai-examples">
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  className="ai-example-chip"
                  onClick={() => handleSearch(ex)}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="error-banner">{error}</div>}

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Parsing your query and searching…
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            {/* Insights */}
            {result.insights?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Filter size={13} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Interpreted as
                  </span>
                  <button
                    className="btn-icon"
                    style={{ marginLeft: 'auto', fontSize: 11 }}
                    onClick={() => setShowFilters(f => !f)}
                  >
                    <Code2 size={13} />
                  </button>
                </div>
                <div className="ai-insights">
                  {result.insights.map((ins, i) => (
                    <span key={i} className="ai-insight-chip">
                      <Sparkles size={10} />
                      {ins}
                    </span>
                  ))}
                </div>

                {/* Parsed filters as pseudo-SQL */}
                {showFilters && Object.keys(result.parsedFilters || {}).length > 0 && (
                  <div className="ai-sql-block">
                    {result.parsedFilters['generated_sql'] ? (
                      result.parsedFilters['generated_sql']
                    ) : (
                      `SELECT * FROM movies\nWHERE ${Object.entries(result.parsedFilters)
                        .filter(([, v]) => v !== undefined)
                        .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
                        .join('\n  AND ')}`
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            {result.resultSummary && (
              <ResultsSummary
                total={result.resultSummary.count}
                movies={result.results || []}
              />
            )}

            {/* Grid */}
            {result.results?.length > 0 ? (
              <div className="movie-grid">
                {result.results.map(movie => (
                  <MovieCard
                    key={movie.tconst}
                    movie={movie}
                    onClick={m => onSelectMovie?.(m)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Sparkles size={36} />
                <p>No movies found for this query. Try rephrasing.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
