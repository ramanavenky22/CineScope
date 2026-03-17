/**
 * routes/analytics.js - Global analytics dashboard endpoints
 */
const express = require('express');
const router = express.Router();

// GET /api/analytics/kpi - Global KPI summary cards
router.get('/kpi', (req, res) => {
  const db = req.app.locals.db;
  const { titleType = 'movie' } = req.query;

  const kpi = db.prepare(`
    SELECT
      COUNT(DISTINCT b.tconst) as totalMovies,
      ROUND(AVG(r.averageRating), 2) as avgRating,
      ROUND(AVG(b.runtimeMinutes), 0) as avgRuntime,
      SUM(b.revenue) as totalRevenue,
      SUM(b.budget) as totalBudget,
      MIN(b.startYear) as earliestYear,
      MAX(b.startYear) as latestYear
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titleType = ?
  `).get(titleType);

  // Top genre - extract via JS (avoids json_each compat issues)
  const allGenreRows = db.prepare(`
    SELECT genres FROM title_basics WHERE titleType = ? AND genres IS NOT NULL
  `).all(titleType);
  const genreCounts = {};
  allGenreRows.forEach(row => {
    row.genres.split(',').forEach(g => {
      const gTrim = g.trim();
      genreCounts[gTrim] = (genreCounts[gTrim] || 0) + 1;
    });
  });
  const topGenreName = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a])[0] || null;

  // Top language
  const topLanguage = db.prepare(`
    SELECT language, COUNT(*) as cnt
    FROM title_akas
    WHERE language IS NOT NULL AND language != '\\N'
    GROUP BY language ORDER BY cnt DESC LIMIT 1
  `).get();

  // Total votes
  const voteMeta = db.prepare(`
    SELECT SUM(r.numVotes) as totalVotes, MAX(r.numVotes) as maxVotes
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titleType = ?
  `).get(titleType);

  res.json({ ...kpi, topGenre: topGenreName, topLanguage: topLanguage?.language || null, ...voteMeta });
});

// GET /api/analytics/genres - Per-genre analytics
router.get('/genres', (req, res) => {
  const db = req.app.locals.db;
  const { titleType = 'movie' } = req.query;

  // Scan genres column and split in JS (avoids SQLite json_each compat issues)
  const rawGenres = db.prepare(`
    SELECT genres FROM title_basics WHERE titleType = ? AND genres IS NOT NULL
  `).all(titleType);

  const genreSet = new Set();
  rawGenres.forEach(row => {
    if (row.genres) row.genres.split(',').forEach(g => genreSet.add(g.trim()));
  });
  const genres = [...genreSet].filter(Boolean).sort();

  const results = genres.map(genre => {
    const safeGenre = genre.replace(/'/g, "''");
    const stats = db.prepare(`
      SELECT
        COUNT(*) as movieCount,
        ROUND(AVG(r.averageRating), 2) as avgRating,
        ROUND(AVG(b.runtimeMinutes), 0) as avgRuntime,
        SUM(b.revenue) as totalRevenue,
        ROUND(AVG(b.revenue), 0) as avgRevenue,
        SUM(r.numVotes) as totalVotes,
        MAX(r.averageRating) as maxRating,
        MIN(r.averageRating) as minRating
      FROM title_basics b
      LEFT JOIN title_ratings r ON b.tconst = r.tconst
      WHERE b.genres LIKE '%${safeGenre}%' AND b.titleType = ?
    `).get(titleType);
    return { genre, ...stats };
  });

  res.json(results.sort((a, b) => b.movieCount - a.movieCount));
});

// GET /api/analytics/trends - Year-by-year trends
router.get('/trends', (req, res) => {
  const db = req.app.locals.db;
  const { titleType = 'movie', startYear = 2000 } = req.query;

  const trends = db.prepare(`
    SELECT
      b.startYear as year,
      COUNT(*) as movieCount,
      ROUND(AVG(r.averageRating), 2) as avgRating,
      ROUND(AVG(b.runtimeMinutes), 0) as avgRuntime,
      SUM(b.revenue) as totalRevenue,
      ROUND(AVG(b.revenue), 0) as avgRevenue,
      SUM(r.numVotes) as totalVotes
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titleType = ? AND b.startYear >= ? AND b.startYear IS NOT NULL
    GROUP BY b.startYear
    ORDER BY b.startYear ASC
  `).all(titleType, parseInt(startYear));

  res.json(trends);
});

// GET /api/analytics/ratings - Rating distribution analytics
router.get('/ratings', (req, res) => {
  const db = req.app.locals.db;
  const { titleType = 'movie' } = req.query;

  // Histogram: bucket every 0.5 step
  const histogram = db.prepare(`
    SELECT
      ROUND(CAST(r.averageRating * 2 AS INTEGER) / 2.0, 1) as bucket,
      COUNT(*) as count
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titleType = ? AND r.averageRating IS NOT NULL
    GROUP BY bucket ORDER BY bucket ASC
  `).all(titleType);

  // Avg rating per year
  const byYear = db.prepare(`
    SELECT b.startYear as year, ROUND(AVG(r.averageRating), 2) as avgRating, COUNT(*) as count
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titleType = ? AND b.startYear IS NOT NULL
    GROUP BY b.startYear ORDER BY b.startYear ASC
  `).all(titleType);

  // Rating by genre (top 10 genres)
  const byGenre = db.prepare(`
    SELECT
      b.genres as genre,
      ROUND(AVG(r.averageRating), 2) as avgRating,
      COUNT(*) as count
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titleType = ? AND b.genres IS NOT NULL
    GROUP BY b.genres
    ORDER BY count DESC LIMIT 15
  `).all(titleType);

  // Counts above/below 7
  const thresholdStats = db.prepare(`
    SELECT
      SUM(CASE WHEN r.averageRating >= 7 THEN 1 ELSE 0 END) as highRated,
      SUM(CASE WHEN r.averageRating < 5 THEN 1 ELSE 0 END) as lowRated,
      SUM(CASE WHEN r.averageRating >= 5 AND r.averageRating < 7 THEN 1 ELSE 0 END) as midRated
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titleType = ? AND r.averageRating IS NOT NULL
  `).get(titleType);

  res.json({ histogram, byYear, byGenre, thresholdStats });
});

// GET /api/analytics/runtime - Runtime analytics
router.get('/runtime', (req, res) => {
  const db = req.app.locals.db;
  const { titleType = 'movie' } = req.query;

  // Distribution in 15-min buckets
  const distribution = db.prepare(`
    SELECT
      (CAST(runtimeMinutes / 15 AS INTEGER) * 15) as bucketStart,
      COUNT(*) as count
    FROM title_basics
    WHERE titleType = ? AND runtimeMinutes IS NOT NULL AND runtimeMinutes > 0
    GROUP BY bucketStart ORDER BY bucketStart ASC
  `).all(titleType);

  // By genre
  const byGenre = db.prepare(`
    SELECT genres as genre, ROUND(AVG(runtimeMinutes), 0) as avgRuntime, COUNT(*) as count
    FROM title_basics
    WHERE titleType = ? AND runtimeMinutes IS NOT NULL
    GROUP BY genres
    ORDER BY count DESC LIMIT 15
  `).all(titleType);

  // Runtime vs rating correlation (buckets)
  const vsRating = db.prepare(`
    SELECT
      ROUND(b.runtimeMinutes / 30.0, 0) * 30 as runtimeBucket,
      ROUND(AVG(r.averageRating), 2) as avgRating,
      COUNT(*) as count
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titleType = ? AND b.runtimeMinutes IS NOT NULL AND r.averageRating IS NOT NULL
    GROUP BY runtimeBucket ORDER BY runtimeBucket ASC
  `).all(titleType);

  const stats = db.prepare(`
    SELECT
      ROUND(AVG(runtimeMinutes), 0) as avgRuntime,
      MIN(runtimeMinutes) as minRuntime,
      MAX(runtimeMinutes) as maxRuntime
    FROM title_basics WHERE titleType = ? AND runtimeMinutes IS NOT NULL
  `).get(titleType);

  res.json({ distribution, byGenre, vsRating, stats });
});

// GET /api/analytics/languages - Language/region analytics
router.get('/languages', (req, res) => {
  const db = req.app.locals.db;

  const byLanguage = db.prepare(`
    SELECT
      a.language,
      COUNT(DISTINCT a.titleId) as movieCount,
      ROUND(AVG(r.averageRating), 2) as avgRating
    FROM title_akas a
    LEFT JOIN title_ratings r ON a.titleId = r.tconst
    WHERE a.language IS NOT NULL AND a.language != '\\N'
    GROUP BY a.language ORDER BY movieCount DESC LIMIT 20
  `).all();

  const byRegion = db.prepare(`
    SELECT
      a.region,
      COUNT(DISTINCT a.titleId) as movieCount,
      ROUND(AVG(r.averageRating), 2) as avgRating
    FROM title_akas a
    LEFT JOIN title_ratings r ON a.titleId = r.tconst
    WHERE a.region IS NOT NULL AND a.region != '\\N'
    GROUP BY a.region ORDER BY movieCount DESC LIMIT 20
  `).all();

  res.json({ byLanguage, byRegion });
});

// GET /api/analytics/top-movies - Leaderboard tables
router.get('/top-movies', (req, res) => {
  const db = req.app.locals.db;
  const { titleType = 'movie', limit = 50 } = req.query;
  const lim = Math.min(100, parseInt(limit));

  const topRated = db.prepare(`
    SELECT b.tconst, b.primaryTitle, b.startYear, b.genres, b.runtimeMinutes,
           b.budget, b.revenue, b.popularity,
           r.averageRating, r.numVotes
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titleType = ? AND r.numVotes >= 1000
    ORDER BY r.averageRating DESC NULLS LAST LIMIT ?
  `).all(titleType, lim);

  const mostVoted = db.prepare(`
    SELECT b.tconst, b.primaryTitle, b.startYear, b.genres,
           r.averageRating, r.numVotes
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titleType = ?
    ORDER BY r.numVotes DESC NULLS LAST LIMIT ?
  `).all(titleType, lim);

  const highestRevenue = db.prepare(`
    SELECT b.tconst, b.primaryTitle, b.startYear, b.genres,
           b.budget, b.revenue, b.popularity, r.averageRating
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titleType = ? AND b.revenue > 0
    ORDER BY b.revenue DESC LIMIT ?
  `).all(titleType, lim);

  const bestROI = db.prepare(`
    SELECT b.tconst, b.primaryTitle, b.startYear, b.genres,
           b.budget, b.revenue,
           ROUND(CAST(b.revenue AS REAL) / NULLIF(b.budget, 0) - 1, 2) as roi,
           r.averageRating
    FROM title_basics b
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titleType = ? AND b.budget > 0 AND b.revenue > 0
    ORDER BY roi DESC LIMIT ?
  `).all(titleType, lim);

  res.json({ topRated, mostVoted, highestRevenue, bestROI });
});

module.exports = router;
