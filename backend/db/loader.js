/**
 * loader.js - Initializes SQLite DB.
 * Auto-detects real TSV files in data/; falls back to mock seed if not found.
 */

const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');
const readline = require('node:readline');
const { seed } = require('./seed');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(__dirname, 'cinescope.db');

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS title_basics (
      tconst          TEXT PRIMARY KEY,
      titleType       TEXT,
      primaryTitle    TEXT,
      originalTitle   TEXT,
      isAdult         INTEGER DEFAULT 0,
      startYear       INTEGER,
      endYear         TEXT,
      runtimeMinutes  INTEGER,
      genres          TEXT,
      budget          INTEGER DEFAULT 0,
      revenue         INTEGER DEFAULT 0,
      popularity      REAL DEFAULT 0,
      posterUrl       TEXT
    );

    CREATE TABLE IF NOT EXISTS title_ratings (
      tconst        TEXT PRIMARY KEY,
      averageRating REAL,
      numVotes      INTEGER
    );

    CREATE TABLE IF NOT EXISTS title_crew (
      tconst    TEXT PRIMARY KEY,
      directors TEXT,
      writers   TEXT
    );

    CREATE TABLE IF NOT EXISTS title_principals (
      tconst    TEXT,
      ordering  INTEGER,
      nconst    TEXT,
      category  TEXT,
      job       TEXT,
      characters TEXT,
      PRIMARY KEY (tconst, ordering)
    );

    CREATE TABLE IF NOT EXISTS title_akas (
      titleId        TEXT,
      ordering       INTEGER,
      title          TEXT,
      region         TEXT,
      language       TEXT,
      types          TEXT,
      attributes     TEXT,
      isOriginalTitle INTEGER,
      PRIMARY KEY (titleId, ordering)
    );

    CREATE TABLE IF NOT EXISTS title_episode (
      tconst        TEXT PRIMARY KEY,
      parentTconst  TEXT,
      seasonNumber  INTEGER,
      episodeNumber INTEGER
    );

    CREATE TABLE IF NOT EXISTS name_basics (
      nconst            TEXT PRIMARY KEY,
      primaryName       TEXT,
      birthYear         TEXT,
      deathYear         TEXT,
      primaryProfession TEXT,
      knownForTitles    TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_tb_startYear  ON title_basics(startYear);
    CREATE INDEX IF NOT EXISTS idx_tb_titleType  ON title_basics(titleType);
    CREATE INDEX IF NOT EXISTS idx_tr_rating     ON title_ratings(averageRating);
    CREATE INDEX IF NOT EXISTS idx_tp_nconst     ON title_principals(nconst);
    CREATE INDEX IF NOT EXISTS idx_tp_tconst     ON title_principals(tconst);
    CREATE INDEX IF NOT EXISTS idx_te_parent     ON title_episode(parentTconst);
    CREATE INDEX IF NOT EXISTS idx_tc_directors  ON title_crew(directors);
  `);
}

async function loadTsvFile(db, filePath, tableName, columnMap) {
  if (!fs.existsSync(filePath)) return false;
  console.log(`[loader] Loading ${path.basename(filePath)} → ${tableName}`);

  const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
  let headers = null;
  let batch = [];
  const BATCH_SIZE = 5000;

  const cols = Object.values(columnMap);
  const placeholders = cols.map(() => '?').join(',');
  const insertStmt = db.prepare(
    `INSERT OR IGNORE INTO ${tableName} (${cols.join(',')}) VALUES (${placeholders})`
  );
  const insertBatch = db.transaction(rows => rows.forEach(r => insertStmt.run(r)));

  for await (const line of rl) {
    if (!headers) { headers = line.split('\t'); continue; }
    const parts = line.split('\t');
    const row = Object.keys(columnMap).map(srcCol => {
      const idx = headers.indexOf(srcCol);
      const val = idx >= 0 ? parts[idx] : null;
      return val === '\\N' ? null : val;
    });
    batch.push(row);
    if (batch.length >= BATCH_SIZE) { insertBatch(batch); batch = []; }
  }
  if (batch.length) insertBatch(batch);
  return true;
}

async function initDb() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  createSchema(db);

  // Check if real TSV files exist
  const coreFile = path.join(DATA_DIR, 'title.basics.tsv');
  const hasRealData = fs.existsSync(coreFile);

  if (hasRealData) {
    console.log('[loader] Real TSV files detected – loading from disk...');
    await loadTsvFile(db, path.join(DATA_DIR, 'title.basics.tsv'), 'title_basics', {
      tconst: 'tconst', titleType: 'titleType', primaryTitle: 'primaryTitle',
      originalTitle: 'originalTitle', isAdult: 'isAdult', startYear: 'startYear',
      endYear: 'endYear', runtimeMinutes: 'runtimeMinutes', genres: 'genres',
    });
    await loadTsvFile(db, path.join(DATA_DIR, 'title.ratings.tsv'), 'title_ratings', {
      tconst: 'tconst', averageRating: 'averageRating', numVotes: 'numVotes',
    });
    await loadTsvFile(db, path.join(DATA_DIR, 'title.crew.tsv'), 'title_crew', {
      tconst: 'tconst', directors: 'directors', writers: 'writers',
    });
    await loadTsvFile(db, path.join(DATA_DIR, 'title.principals.tsv'), 'title_principals', {
      tconst: 'tconst', ordering: 'ordering', nconst: 'nconst',
      category: 'category', job: 'job', characters: 'characters',
    });
    await loadTsvFile(db, path.join(DATA_DIR, 'title.akas.tsv'), 'title_akas', {
      titleId: 'titleId', ordering: 'ordering', title: 'title',
      region: 'region', language: 'language', types: 'types',
      attributes: 'attributes', isOriginalTitle: 'isOriginalTitle',
    });
    await loadTsvFile(db, path.join(DATA_DIR, 'title.episode.tsv'), 'title_episode', {
      tconst: 'tconst', parentTconst: 'parentTconst',
      seasonNumber: 'seasonNumber', episodeNumber: 'episodeNumber',
    });
    await loadTsvFile(db, path.join(DATA_DIR, 'name.basics.tsv'), 'name_basics', {
      nconst: 'nconst', primaryName: 'primaryName', birthYear: 'birthYear',
      deathYear: 'deathYear', primaryProfession: 'primaryProfession',
      knownForTitles: 'knownForTitles',
    });
  } else {
    console.log('[loader] No real TSV files found – using mock seed data.');
    const count = db.prepare('SELECT COUNT(*) as c FROM title_basics').get();
    if (count.c === 0) seed(db);
    else console.log('[loader] Mock data already present, skipping re-seed.');
  }

  console.log(`[loader] DB ready: ${db.prepare('SELECT COUNT(*) as c FROM title_basics').get().c} titles`);
  return db;
}

module.exports = { initDb };
