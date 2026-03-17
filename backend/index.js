const express = require('express');
const cors = require('cors');
const path = require('node:path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// For the hackathon backend, we keep data in a JSON file under backend/data.
// eslint-disable-next-line import/no-dynamic-require, global-require
const movies = require(path.join(__dirname, 'data', 'movies.json'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cinescope-backend' });
});

app.get('/api/movies', (_req, res) => {
  res.json({ movies });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`CineScope backend running on http://localhost:${PORT}`);
});

