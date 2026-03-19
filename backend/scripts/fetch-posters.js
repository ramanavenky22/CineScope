#!/usr/bin/env node
/**
 * fetch-posters.js - Fetches real movie poster URLs from TMDB API
 * and updates the SQLite database.
 *
 * Usage:
 *   TMDB_API_KEY=your_key node scripts/fetch-posters.js
 *
 * Get a free TMDB API key at: https://www.themoviedb.org/settings/api
 */

const Database = require('better-sqlite3');
const { execSync } = require('node:child_process');
const path = require('node:path');

const DB_PATH = path.join(__dirname, '..', 'db', 'cinescope.db');
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const API_KEY = process.env.TMDB_API_KEY;

if (!API_KEY) {
  console.error('Error: TMDB_API_KEY environment variable is required.');
  console.error('Get a free key at: https://www.themoviedb.org/settings/api');
  console.error('Usage: TMDB_API_KEY=your_key node scripts/fetch-posters.js');
  process.exit(1);
}

function searchTMDB(title, type = 'movie') {
  const endpoint = type === 'tvSeries' ? 'tv' : 'movie';
  const url = `https://api.themoviedb.org/3/search/${endpoint}?query=${encodeURIComponent(title)}&api_key=${API_KEY}&page=1`;
  try {
    const raw = execSync(`curl -s "${url}"`, { timeout: 10000 }).toString();
    const data = JSON.parse(raw);
    const result = data.results?.[0];
    return result?.poster_path ? `${TMDB_IMG_BASE}${result.poster_path}` : null;
  } catch {
    return null;
  }
}

function main() {
  const db = new Database(DB_PATH);

  const movies = db.prepare(
    'SELECT tconst, primaryTitle, titleType FROM title_basics'
  ).all();

  console.log(`Fetching posters for ${movies.length} titles...`);

  const update = db.prepare('UPDATE title_basics SET posterUrl = ? WHERE tconst = ?');
  let found = 0;
  let failed = 0;

  for (const movie of movies) {
    const posterUrl = searchTMDB(movie.primaryTitle, movie.titleType);
    if (posterUrl) {
      update.run(posterUrl, movie.tconst);
      found++;
    } else {
      failed++;
    }
    process.stdout.write(`\r  ${found} found, ${failed} failed (${found + failed}/${movies.length})`);
  }

  console.log(`\nDone! ${found}/${movies.length} posters updated.`);
  db.close();
}

main();
