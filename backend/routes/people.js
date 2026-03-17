/**
 * routes/people.js - Person detail and director/actor analytics
 */
const express = require('express');
const router = express.Router();

// GET /api/people/:id - Person detail + filmography
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;

  const person = db.prepare(`
    SELECT * FROM name_basics WHERE nconst = ?
  `).get(id);

  if (!person) return res.status(404).json({ error: 'Person not found' });

  // Known for titles
  const knownTitles = person.knownForTitles
    ? person.knownForTitles.split(',').map(tconst => {
        return db.prepare(`
          SELECT b.tconst, b.primaryTitle, b.startYear, b.genres, r.averageRating
          FROM title_basics b
          LEFT JOIN title_ratings r ON b.tconst = r.tconst
          WHERE b.tconst = ?
        `).get(tconst);
      }).filter(Boolean)
    : [];

  // Full filmography via principals
  const filmography = db.prepare(`
    SELECT b.tconst, b.primaryTitle, b.startYear, b.genres, b.titleType,
           r.averageRating, r.numVotes, p.category, p.characters
    FROM title_principals p
    JOIN title_basics b ON p.tconst = b.tconst
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE p.nconst = ?
    ORDER BY b.startYear DESC NULLS LAST
  `).all(id);

  // Director credits
  const directed = db.prepare(`
    SELECT b.tconst, b.primaryTitle, b.startYear, b.genres,
           r.averageRating, r.numVotes, b.revenue
    FROM title_crew c
    JOIN title_basics b ON c.tconst = b.tconst
    LEFT JOIN title_ratings r ON b.tconst = r.tconst
    WHERE c.directors LIKE ?
    ORDER BY b.startYear DESC NULLS LAST
  `).all(`%${id}%`);

  res.json({
    ...person,
    primaryProfession: person.primaryProfession ? person.primaryProfession.split(',') : [],
    knownForTitles: knownTitles,
    filmography,
    directed,
  });
});

// GET /api/analytics/directors - Top directors leaderboard
router.get('/analytics/directors', (req, res) => {
  const db = req.app.locals.db;
  const { limit = 20, minMovies = 2 } = req.query;

  // Explode directors field (comma-separated nconsts)
  // For each director nconst, aggregate their movies
  const directors = db.prepare(`
    SELECT
      n.nconst,
      n.primaryName,
      n.birthYear,
      COUNT(DISTINCT c.tconst) as movieCount,
      ROUND(AVG(r.averageRating), 2) as avgRating,
      MAX(r.averageRating) as maxRating,
      SUM(b.revenue) as totalRevenue
    FROM title_crew c
    JOIN title_basics b ON c.tconst = b.tconst
    LEFT JOIN title_ratings r ON c.tconst = r.tconst
    JOIN name_basics n ON c.directors LIKE '%' || n.nconst || '%'
    WHERE b.titleType = 'movie'
    GROUP BY n.nconst
    HAVING movieCount >= ?
    ORDER BY avgRating DESC NULLS LAST
    LIMIT ?
  `).all(parseInt(minMovies), parseInt(limit));

  res.json(directors);
});

// GET /api/analytics/actors - Top actors leaderboard
router.get('/analytics/actors', (req, res) => {
  const db = req.app.locals.db;
  const { limit = 20, minMovies = 2 } = req.query;

  const actors = db.prepare(`
    SELECT
      n.nconst,
      n.primaryName,
      n.birthYear,
      COUNT(DISTINCT p.tconst) as movieCount,
      ROUND(AVG(r.averageRating), 2) as avgRating,
      MAX(r.averageRating) as bestRating,
      p.category
    FROM title_principals p
    JOIN name_basics n ON p.nconst = n.nconst
    LEFT JOIN title_ratings r ON p.tconst = r.tconst
    WHERE p.category IN ('actor', 'actress')
    GROUP BY n.nconst
    HAVING movieCount >= ?
    ORDER BY movieCount DESC
    LIMIT ?
  `).all(parseInt(minMovies), parseInt(limit));

  res.json(actors);
});

module.exports = router;
