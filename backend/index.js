const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/loader');

const moviesRouter = require('./routes/movies');
const analyticsRouter = require('./routes/analytics');
const peopleRouter = require('./routes/people');
const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  const db = _req.app.locals.db;
  const meta = db ? db.prepare('SELECT COUNT(*) as titles FROM title_basics').get() : null;
  res.json({ status: 'ok', service: 'cinescope-backend', dbTitles: meta?.titles ?? 0 });
});

// Mount routers
app.use('/api/movies', moviesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/people', peopleRouter);
app.use('/api/search', searchRouter);
// People analytics sub-routes (directors/actors)
app.use('/api', peopleRouter);

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Start: init DB first, then listen
(async () => {
  try {
    const db = await initDb();
    app.locals.db = db;
    app.listen(PORT, () => {
      console.log(`CineScope backend running on http://localhost:${PORT}`);
      console.log('Available routes:');
      console.log('  GET  /api/health');
      console.log('  GET  /api/movies');
      console.log('  GET  /api/movies/:id');
      console.log('  GET  /api/movies/:id/analytics');
      console.log('  GET  /api/movies/:id/similar');
      console.log('  GET  /api/movies/:id/cast');
      console.log('  GET  /api/analytics/kpi');
      console.log('  GET  /api/analytics/genres');
      console.log('  GET  /api/analytics/trends');
      console.log('  GET  /api/analytics/ratings');
      console.log('  GET  /api/analytics/runtime');
      console.log('  GET  /api/analytics/languages');
      console.log('  GET  /api/analytics/top-movies');
      console.log('  GET  /api/people/:id');
      console.log('  GET  /api/analytics/directors');
      console.log('  GET  /api/analytics/actors');
      console.log('  GET  /api/search?q=');
      console.log('  POST /api/search/natural');
    });
  } catch (err) {
    console.error('[startup] Failed to initialize database:', err);
    process.exit(1);
  }
})();
