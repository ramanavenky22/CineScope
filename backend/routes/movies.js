/**
 * routes/movies.js - Movie search, detail, analytics, similar, cast endpoints
 */
const express = require('express');
const router = express.Router();

// GET /api/movies - Search/list movies with filters
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const {
    q, genre, titleType = 'movie', startYear, endYear,
    minRating, maxRating, language, region,
    page = 1, limit = 20, sort = 'rating', order = 'desc',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const allowedSorts = {
    rating: 'r.averageRating', votes: 'r.numVotes',
    year: 'b.startYear', title: 'b.primaryTitle',
    revenue: 'b.revenue', runtime: 'b.runtimeMinutes',
    popularity: 'b.popularity',
  };
  const sortCol = allowedSorts[sort] || 'r.averageRating';
  const sortDir = order === 'asc' ? 'ASC' : 'DESC';

  const conditions = ['1=1'];
  const params = {};

  if (titleType) { conditions.push('b.titleType = @titleType'); params.titleType = titleType; }
  if (q) {
    conditions.push('b.primaryTitle LIKE @q');
    params.q = `%${q}%`;
  }
  if (genre) { conditions.push(`b.genres LIKE @genre`); params.genre = `%${genre}%`; }
  if (startYear) { conditions.push('b.startYear >= @startYear'); params.startYear = parseInt(startYear); }
  if (endYear) { conditions.push('b.startYear <= @endYear'); params.endYear = parseInt(endYear); }
  if (minRating) { conditions.push('r.averageRating >= @minRating'); params.minRating = parseFloat(minRating); }
  if (maxRating) { conditions.push('r.averageRating <= @maxRating'); params.maxRating = parseFloat(maxRating); }
  if (language) { conditions.push('a.language = @language'); }
  if (region) { conditions.push('a.region = @region'); }

  const joinAka = (language || region) ? `
    LEFT JOIN title_akas a ON b.tconst = a.titleId AND a.isOriginalTitle = 1
  ` : '';
  if (language) params.language = language;
  if (region) params.region = region;

  const where = conditions.join(' AND ');

  const countRow = db.prepare(`
    SELECT COUNT(DISTINCT b.tconst) as total
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    ${joinAka}
    WHERE ${where}
  `).get(params);

  const rows = db.prepare(`
    SELECT DISTINCT
      b.tconst, b.primaryTitle, b.titleType, b.startYear,
      b.runtimeMinutes, b.genres, b.isAdult,
      b.budget, b.revenue, b.popularity,
      r.averageRating, r.numVotes
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    ${joinAka}
    WHERE ${where}
    ORDER BY ${sortCol} ${sortDir} NULLS LAST
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit: limitNum, offset });

  res.json({
    total: countRow.total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(countRow.total / limitNum),
    results: rows,
  });
});

// GET /api/movies/:id - Full movie detail
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;

  const movie = db.prepare(`
    SELECT b.*, r.averageRating, r.numVotes,
           c.directors, c.writers
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    LEFT JOIN title_crew c ON b.tconst = c.tconst
    WHERE b.tconst = ?
  `).get(id);

  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  // Get regional titles/akas
  const akas = db.prepare(`
    SELECT title, region, language, types, isOriginalTitle
    FROM title_akas WHERE titleId = ? ORDER BY isOriginalTitle DESC
  `).all(id);

  // Resolve director names
  const directorNames = movie.directors
    ? movie.directors.split(',').map(nconst => {
        const p = db.prepare('SELECT nconst, primaryName, birthYear FROM name_basics WHERE nconst=?').get(nconst);
        return p || { nconst, primaryName: 'Unknown' };
      })
    : [];

  const writerNames = movie.writers
    ? movie.writers.split(',').map(nconst => {
        const p = db.prepare('SELECT nconst, primaryName FROM name_basics WHERE nconst=?').get(nconst);
        return p || { nconst, primaryName: 'Unknown' };
      })
    : [];

  res.json({
    ...movie,
    genres: movie.genres ? movie.genres.split(',') : [],
    directors: directorNames,
    writers: writerNames,
    akas,
  });
});

// GET /api/movies/:id/cast - Cast and crew
router.get('/:id/cast', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;

  const cast = db.prepare(`
    SELECT p.tconst, p.ordering, p.nconst, p.category, p.job, p.characters,
           n.primaryName, n.birthYear, n.primaryProfession
    FROM title_principals p
    LEFT JOIN name_basics n ON p.nconst = n.nconst
    WHERE p.tconst = ?
    ORDER BY p.ordering
  `).all(id);

  if (!cast.length) return res.status(404).json({ error: 'No cast found for this title' });

  // For each actor, fetch their top known movies
  const enriched = cast.map(member => {
    const otherMovies = db.prepare(`
      SELECT b.tconst, b.primaryTitle, b.startYear, r.averageRating
      FROM title_principals tp
      JOIN title_basics b ON tp.tconst = b.tconst
      LEFT JOIN title_ratings r ON b.tconst = r.tconst
      WHERE tp.nconst = ? AND tp.tconst != ?
      ORDER BY r.averageRating DESC NULLS LAST
      LIMIT 5
    `).all(member.nconst, id);
    return { ...member, otherMovies };
  });

  res.json({ tconst: id, cast: enriched });
});

// GET /api/movies/:id/similar - Similar movies
router.get('/:id/similar', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { limit = 12 } = req.query;

  const base = db.prepare(`
    SELECT b.genres, b.startYear, c.directors, r.averageRating
    FROM title_basics b
    LEFT JOIN title_crew c ON b.tconst = c.tconst
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.tconst = ?
  `).get(id);

  if (!base) return res.status(404).json({ error: 'Movie not found' });

  const genres = base.genres ? base.genres.split(',') : [];
  const minRating = Math.max(0, (base.averageRating || 5) - 1.5);
  const maxRating = Math.min(10, (base.averageRating || 5) + 1.5);
  const genreConditions = genres.map(g => `b.genres LIKE '%${g.replace(/'/g, "''")}%'`).join(' OR ');

  const similar = db.prepare(`
    SELECT b.tconst, b.primaryTitle, b.startYear, b.genres, b.runtimeMinutes,
           r.averageRating, r.numVotes
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.tconst != ?
      AND b.titleType = 'movie'
      ${genres.length ? `AND (${genreConditions})` : ''}
      AND (r.averageRating BETWEEN ? AND ? OR r.averageRating IS NULL)
    ORDER BY r.averageRating DESC NULLS LAST
    LIMIT ?
  `).all(id, minRating, maxRating, parseInt(limit));

  res.json({ tconst: id, similar });
});

// GET /api/movies/:id/analytics - Per-movie analytics & benchmarks
router.get('/:id/analytics', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;

  const movie = db.prepare(`
    SELECT b.tconst, b.primaryTitle, b.startYear, b.genres, b.runtimeMinutes,
           b.budget, b.revenue, b.popularity,
           r.averageRating, r.numVotes
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.tconst = ?
  `).get(id);

  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  const genres = movie.genres ? movie.genres.split(',') : [];
  const primaryGenre = genres[0] || null;

  // Genre benchmarks
  let genreAvg = null;
  if (primaryGenre) {
    genreAvg = db.prepare(`
      SELECT
        ROUND(AVG(r.averageRating), 2) as avgRating,
        ROUND(AVG(b.runtimeMinutes), 0) as avgRuntime,
        ROUND(AVG(b.revenue), 0) as avgRevenue,
        COUNT(*) as totalInGenre
      FROM title_basics b
      LEFT JOIN title_ratings r ON b.tconst = r.tconst
      WHERE b.genres LIKE ? AND b.titleType = 'movie'
    `).get(`%${primaryGenre}%`);
  }

  // Year rank by rating
  const yearRank = movie.startYear ? db.prepare(`
    SELECT COUNT(*) + 1 as rank
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.startYear = ? AND b.tconst != ?
      AND b.titleType = 'movie'
      AND r.averageRating > ?
  `).get(movie.startYear, id, movie.averageRating || 0) : null;

  // Year rank by revenue in genre
  let genreYearRank = null;
  if (primaryGenre && movie.startYear && movie.revenue) {
    genreYearRank = db.prepare(`
      SELECT COUNT(*) + 1 as rank
      FROM title_basics b
      WHERE b.startYear = ? AND b.genres LIKE ? AND b.tconst != ?
        AND b.revenue > ?
    `).get(movie.startYear, `%${primaryGenre}%`, id, movie.revenue || 0);
  }

  // ROI
  const roi = movie.budget > 0 ? parseFloat(((movie.revenue / movie.budget) - 1).toFixed(2)) : null;
  const roiCategory = roi === null ? null : roi >= 2 ? 'High' : roi >= 0.5 ? 'Medium' : roi >= 0 ? 'Low' : 'Loss';

  // Year average (all genres)
  const yearAvg = movie.startYear ? db.prepare(`
    SELECT ROUND(AVG(r.averageRating), 2) as avgRating,
           ROUND(AVG(b.popularity), 2) as avgPopularity
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.startYear = ? AND b.titleType = 'movie'
  `).get(movie.startYear) : null;

  res.json({
    movie,
    benchmarks: {
      genreAvg,
      yearAvg,
      ratingVsGenreAvg: movie.averageRating && genreAvg?.avgRating
        ? parseFloat((movie.averageRating - genreAvg.avgRating).toFixed(2)) : null,
      ratingVsYearAvg: movie.averageRating && yearAvg?.avgRating
        ? parseFloat((movie.averageRating - yearAvg.avgRating).toFixed(2)) : null,
      runtimeVsGenreAvg: movie.runtimeMinutes && genreAvg?.avgRuntime
        ? movie.runtimeMinutes - genreAvg.avgRuntime : null,
      revenueVsGenreAvg: movie.revenue && genreAvg?.avgRevenue
        ? movie.revenue - genreAvg.avgRevenue : null,
    },
    rankings: {
      yearRankByRating: yearRank?.rank || null,
      genreYearRankByRevenue: genreYearRank?.rank || null,
    },
    financials: {
      budget: movie.budget,
      revenue: movie.revenue,
      profit: movie.budget > 0 && movie.revenue > 0 ? movie.revenue - movie.budget : null,
      roi,
      roiCategory,
    },
  });
});

module.exports = router;
