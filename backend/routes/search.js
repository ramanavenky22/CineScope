/**
 * routes/search.js - Natural language search + unified text search
 */
const express = require('express');
const router = express.Router();

/**
 * Simple NL parser: extracts structured filters from free-text query.
 * This is a keyword-rules approach for MVP; ready to swap for AI/SQL generation.
 */
function parseNaturalQuery(text) {
  const lower = text.toLowerCase();
  const filters = {};
  const insights = [];

  // Genre detection
  const GENRES = ['action', 'adventure', 'animation', 'comedy', 'crime', 'documentary',
    'drama', 'fantasy', 'horror', 'mystery', 'romance', 'sci-fi', 'thriller',
    'western', 'biography', 'history', 'music', 'sport', 'war', 'family'];
  const matchedGenres = GENRES.filter(g => lower.includes(g));
  if (matchedGenres.length) {
    filters.genre = matchedGenres[0];
    insights.push(`Genre: ${matchedGenres.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}`);
  }

  // Year extraction
  const yearMatch = lower.match(/(?:after|since|from)\s+(\d{4})/);
  const beforeMatch = lower.match(/(?:before|until|up to)\s+(\d{4})/);
  const exactYearMatch = lower.match(/\bin\s+(\d{4})\b/);
  const decadeMatch = lower.match(/(\d{4})s/);
  if (yearMatch) { filters.startYear = parseInt(yearMatch[1]); insights.push(`After ${yearMatch[1]}`); }
  if (beforeMatch) { filters.endYear = parseInt(beforeMatch[1]); insights.push(`Before ${beforeMatch[1]}`); }
  if (exactYearMatch) { filters.startYear = filters.endYear = parseInt(exactYearMatch[1]); }
  if (decadeMatch && !yearMatch) {
    const decade = parseInt(decadeMatch[1]);
    filters.startYear = decade;
    filters.endYear = decade + 9;
    insights.push(`${decade}s decade`);
  }

  // Rating threshold
  const ratingMatch = lower.match(/rating\s*(?:above|over|>|>=|at least)\s*([\d.]+)/);
  const topRated = lower.includes('top rated') || lower.includes('best') || lower.includes('highest rated');
  if (ratingMatch) { filters.minRating = parseFloat(ratingMatch[1]); insights.push(`Min rating: ${filters.minRating}`); }
  else if (topRated) { filters.minRating = 7.5; insights.push('High rated (≥7.5)'); }

  // Sort intent
  if (lower.includes('popular') || lower.includes('most voted')) {
    filters.sort = 'votes'; filters.order = 'desc';
    insights.push('Sorted by popularity');
  } else if (lower.includes('recent') || lower.includes('latest') || lower.includes('newest')) {
    filters.sort = 'year'; filters.order = 'desc';
    insights.push('Sorted by release year (newest first)');
  } else if (lower.includes('revenue') || lower.includes('box office') || lower.includes('grossing')) {
    filters.sort = 'revenue'; filters.order = 'desc';
    insights.push('Sorted by revenue');
  } else if (topRated || lower.includes('top')) {
    filters.sort = 'rating'; filters.order = 'desc';
    insights.push('Sorted by rating');
  }

  // Title type
  if (lower.includes('tv') || lower.includes('series') || lower.includes('show')) {
    filters.titleType = 'tvSeries';
    insights.push('Type: TV Series');
  } else {
    filters.titleType = 'movie';
  }

  // Director mention (simple pattern: "by/directed by Name")
  const directorMatch = lower.match(/(?:by|directed by|from director)\s+([a-z\s]+?)(?:\s+with|\s+and|\s+that|$)/);
  if (directorMatch) {
    filters.directorQuery = directorMatch[1].trim();
    insights.push(`Director: ${directorMatch[1].trim()}`);
  }

  // Freetext keyword (remaining words)
  const cleanedText = text
    .replace(/(?:after|since|before|until|from|in|by|directed by|from director|with|rating above|over|at least|top rated|best|most popular|recent|latest|newest)\s+[\d\w\s.]+/gi, '')
    .replace(/\b(sci-fi|scifi|movies|films|show me|find|search|give me|list|top|good|great|excellent)\b/gi, '')
    .trim();
  if (cleanedText.length > 2 && !matchedGenres.length) {
    filters.q = cleanedText;
    insights.push(`Keyword: "${cleanedText}"`);
  }

  return { filters, insights };
}

// POST /api/search/natural - Natural language → filters → results
router.post('/natural', (req, res) => {
  const db = req.app.locals.db;
  const { query, limit = 20 } = req.body;
  if (!query) return res.status(400).json({ error: 'query is required' });

  const { filters, insights } = parseNaturalQuery(query);
  const lim = Math.min(100, parseInt(limit));

  const conditions = ['1=1'];
  const params = {};

  if (filters.titleType) { conditions.push('b.titleType = @titleType'); params.titleType = filters.titleType; }
  if (filters.genre) { conditions.push('b.genres LIKE @genre'); params.genre = `%${filters.genre}%`; }
  if (filters.startYear) { conditions.push('b.startYear >= @startYear'); params.startYear = filters.startYear; }
  if (filters.endYear) { conditions.push('b.startYear <= @endYear'); params.endYear = filters.endYear; }
  if (filters.minRating) { conditions.push('r.averageRating >= @minRating'); params.minRating = filters.minRating; }
  if (filters.q) { conditions.push('b.primaryTitle LIKE @q'); params.q = `%${filters.q}%`; }

  const allowedSorts = {
    rating: 'r.averageRating', votes: 'r.numVotes',
    year: 'b.startYear', revenue: 'b.revenue',
  };
  const sortCol = allowedSorts[filters.sort] || 'r.averageRating';
  const sortDir = filters.order === 'asc' ? 'ASC' : 'DESC';

  // Director filter: find matching directors by name, then filter titles
  let directorTconsts = null;
  if (filters.directorQuery) {
    const directors = db.prepare(`
      SELECT nconst FROM name_basics
      WHERE primaryName LIKE ? AND primaryProfession LIKE '%director%'
      LIMIT 5
    `).all(`%${filters.directorQuery}%`);

    if (directors.length) {
      const nconsts = directors.map(d => d.nconst);
      const dirTconsts = db.prepare(`
        SELECT DISTINCT tconst FROM title_crew
        WHERE ${nconsts.map(() => 'directors LIKE ?').join(' OR ')}
      `).all(...nconsts.map(n => `%${n}%`)).map(r => r.tconst);
      if (dirTconsts.length) {
        directorTconsts = dirTconsts;
        const placeholders = dirTconsts.map(() => '?').join(',');
        conditions.push(`b.tconst IN (${placeholders})`);
        Object.assign(params, Object.fromEntries(dirTconsts.map((t, i) => [`__dt${i}`, t])));
      }
    }
  }

  const where = conditions.join(' AND ');

  // Execute with array params when director filter is present
  let results;
  if (directorTconsts) {
    const paramValues = { ...params };
    delete paramValues.titleType; // will re-add positionally
    const stmt = db.prepare(`
      SELECT b.tconst, b.primaryTitle, b.titleType, b.startYear,
             b.genres, b.runtimeMinutes, b.budget, b.revenue, b.popularity, b.posterUrl,
             r.averageRating, r.numVotes
      FROM title_basics b
      LEFT JOIN title_ratings r ON b.tconst = r.tconst
      WHERE ${where}
      ORDER BY ${sortCol} ${sortDir} NULLS LAST
      LIMIT ${lim}
    `);
    results = stmt.all(params);
  } else {
    results = db.prepare(`
      SELECT b.tconst, b.primaryTitle, b.titleType, b.startYear,
             b.genres, b.runtimeMinutes, b.budget, b.revenue, b.popularity, b.posterUrl,
             r.averageRating, r.numVotes
      FROM title_basics b
      LEFT JOIN title_ratings r ON b.tconst = r.tconst
      WHERE ${where}
      ORDER BY ${sortCol} ${sortDir} NULLS LAST
      LIMIT @limit
    `).all({ ...params, limit: lim });
  }

  // Summary stats of results
  const avgRating = results.length
    ? parseFloat((results.reduce((s, r) => s + (r.averageRating || 0), 0) / results.length).toFixed(2))
    : null;
  const topGenre = results.length
    ? results.flatMap(r => (r.genres || '').split(',')).reduce((acc, g) => {
        acc[g] = (acc[g] || 0) + 1; return acc;
      }, {})
    : {};
  const topGenreName = Object.keys(topGenre).sort((a, b) => topGenre[b] - topGenre[a])[0] || null;

  res.json({
    query,
    parsedFilters: filters,
    insights,
    resultSummary: {
      count: results.length,
      avgRating,
      topGenre: topGenreName,
    },
    results,
  });
});

// GET /api/search - Unified search: movies + people
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { q, limit = 10 } = req.query;
  if (!q) return res.status(400).json({ error: 'q parameter is required' });
  const lim = Math.min(50, parseInt(limit));

  const movies = db.prepare(`
    SELECT b.tconst, b.primaryTitle as name, 'movie' as type,
           b.startYear, b.genres, r.averageRating
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.primaryTitle LIKE ? AND b.titleType IN ('movie','tvSeries')
    ORDER BY r.averageRating DESC NULLS LAST LIMIT ?
  `).all(`%${q}%`, lim);

  const people = db.prepare(`
    SELECT nconst as id, primaryName as name, 'person' as type,
           primaryProfession, birthYear
    FROM name_basics
    WHERE primaryName LIKE ?
    LIMIT ?
  `).all(`%${q}%`, Math.ceil(lim / 2));

  res.json({ query: q, movies, people });
});

module.exports = router;
