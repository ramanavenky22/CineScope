/**
 * routes/search.js - Natural language search + unified text search
 */
const express = require('express');
const router = express.Router();

// POST /api/search/natural - Natural language → SQL → results
router.post('/natural', async (req, res) => {
  const db = req.app.locals.db;
  const { query, limit = 20 } = req.body;
  if (!query) return res.status(400).json({ error: 'query is required' });

  const lim = Math.min(100, parseInt(limit));

  // Ensure Gemini API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY is not set. Please add it to your environment variables.' 
    });
  }

  try {
    const { GoogleGenAI } = require('@google/genai');
    const fs = require('fs');
    const path = require('path');

    const ai = new GoogleGenAI({ apiKey });

    // Load the DB schema to provide context to Gemini
    const schemaPath = path.join(__dirname, '../db-schema.md');
    const dbSchema = fs.readFileSync(schemaPath, 'utf8');

    const prompt = `You are a SQLite database expert. Below is the database schema for our application, CineScope:\n\n${dbSchema}\n\n` +
      `The user entered the following natural language search query: "${query}"\n\n` +
      `Generate a single valid SQLite query to retrieve the appropriate movies or TV shows.\n` +
      `You MUST strictly select exactly these columns in your SELECT clause:\n` +
      `b.tconst, b.primaryTitle, b.titleType, b.startYear, b.genres, b.runtimeMinutes, b.budget, b.revenue, b.popularity, r.averageRating, r.numVotes\n\n` +
      `Assume "title_basics" is aliased as "b". If you need ratings, join "title_ratings" aliased as "r" on "b.tconst = r.tconst". ` +
      `If you need crew/directors, join "title_crew" or "title_principals" etc. based on the schema.\n` +
      `Filter and sort logically based on the user's request.\n` +
      `Always append LIMIT ${lim} to the end of the query.\n\n` +
      `Output ONLY the raw SQL query. Do not wrap it in markdown formatting (like \`\`\`sql) and do not provide any explanation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    let sqlQuery = response.text.trim();

    // Clean up potential markdown formatting if the model still outputs it
    sqlQuery = sqlQuery.replace(/^```(?:sql|sqlite)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Log for debugging
    console.log('Gemini Generated Query:', sqlQuery);

    const results = db.prepare(sqlQuery).all();

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
      parsedFilters: { ai_generated: true, generated_sql: sqlQuery },
      insights: [ 'Gemini Natural Language Search used', 'Generated SQL dynamically' ],
      resultSummary: {
        count: results.length,
        avgRating,
        topGenre: topGenreName,
      },
      results,
    });
  } catch (error) {
    console.error('Gemini Search Error:', error);
    res.status(500).json({ error: 'Failed to process natural language search.', details: error.message });
  }
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
