# CineScope Database Schema

## Overview

- **Database Engine:** SQLite 3.x (via `better-sqlite3` ^12.8.0)
- **File Location:** `backend/db/cinescope.db`
- **WAL Mode:** Enabled (`journal_mode = WAL`, `synchronous = NORMAL`)
- **Schema Source:** `backend/db/loader.js` (created on startup)
- **Seed Data:** `backend/db/seed.js` (mock IMDB-compatible data)
- **Query Layer:** Raw SQL in route handlers (no ORM/migrations)

---

## Tables

### 1. `title_basics`
Core metadata for movies, TV series, and other titles.

| Column           | Type    | Constraints        | Description                                      |
|------------------|---------|--------------------|--------------------------------------------------|
| `tconst`         | TEXT    | PRIMARY KEY        | Unique title ID (e.g., `tt0111161`)              |
| `titleType`      | TEXT    |                    | `movie`, `tvSeries`, `short`, `tvMovie`          |
| `primaryTitle`   | TEXT    |                    | Main display title                               |
| `originalTitle`  | TEXT    |                    | Original language title                          |
| `isAdult`        | INTEGER | DEFAULT 0          | `1` if adult content, `0` otherwise              |
| `startYear`      | INTEGER |                    | Release year (or series start year)              |
| `endYear`        | TEXT    |                    | Series end year (`\N` if ongoing or N/A)         |
| `runtimeMinutes` | INTEGER |                    | Duration in minutes                              |
| `genres`         | TEXT    |                    | Comma-separated genres (e.g., `"Action,Drama"`)  |
| `budget`         | INTEGER | DEFAULT 0          | Production budget (USD)                          |
| `revenue`        | INTEGER | DEFAULT 0          | Box office revenue (USD)                         |
| `popularity`     | REAL    | DEFAULT 0          | Popularity score                                 |

**Indexes:**
- `idx_tb_startYear` ON `title_basics(startYear)`
- `idx_tb_titleType` ON `title_basics(titleType)`

---

### 2. `title_ratings`
IMDB-style ratings for titles.

| Column          | Type    | Constraints | Description                    |
|-----------------|---------|-------------|--------------------------------|
| `tconst`        | TEXT    | PRIMARY KEY | References `title_basics`      |
| `averageRating` | REAL    |             | Average rating on 0–10 scale   |
| `numVotes`      | INTEGER |             | Total number of votes/reviews  |

**Indexes:**
- `idx_tr_rating` ON `title_ratings(averageRating)`

---

### 3. `title_crew`
Directors and writers associated with each title.

| Column      | Type | Constraints | Description                                         |
|-------------|------|-------------|-----------------------------------------------------|
| `tconst`    | TEXT | PRIMARY KEY | References `title_basics`                           |
| `directors` | TEXT |             | Comma-separated `nconst` IDs of directors           |
| `writers`   | TEXT |             | Comma-separated `nconst` IDs of writers             |

**Indexes:**
- `idx_tc_directors` ON `title_crew(directors)`

---

### 4. `title_principals`
Full cast and crew listing for each title (billing order).

| Column       | Type    | Constraints              | Description                                          |
|--------------|---------|--------------------------|------------------------------------------------------|
| `tconst`     | TEXT    | PRIMARY KEY (composite)  | References `title_basics`                            |
| `ordering`   | INTEGER | PRIMARY KEY (composite)  | Billing position (1 = top billed)                    |
| `nconst`     | TEXT    |                          | References `name_basics` (person ID)                 |
| `category`   | TEXT    |                          | Role type: `actor`, `actress`, `director`, `writer`  |
| `job`        | TEXT    |                          | Specific job title (e.g., `"director of photography"`)|
| `characters` | TEXT    |                          | JSON array of character names played                 |

**Primary Key:** `(tconst, ordering)`

**Indexes:**
- `idx_tp_nconst` ON `title_principals(nconst)`
- `idx_tp_tconst` ON `title_principals(tconst)`

---

### 5. `title_akas`
Alternative and regional titles for each title.

| Column            | Type    | Constraints              | Description                                             |
|-------------------|---------|--------------------------|---------------------------------------------------------|
| `titleId`         | TEXT    | PRIMARY KEY (composite)  | References `title_basics`                               |
| `ordering`        | INTEGER | PRIMARY KEY (composite)  | Variant index                                           |
| `title`           | TEXT    |                          | Alternative title text                                  |
| `region`          | TEXT    |                          | Country code (e.g., `US`, `GB`, `FR`, `JP`)             |
| `language`        | TEXT    |                          | Language code (e.g., `en`, `fr`, `de`, `ja`)            |
| `types`           | TEXT    |                          | `original`, `imdbDisplay`, `alternative`, `tv`          |
| `attributes`      | TEXT    |                          | Additional metadata                                     |
| `isOriginalTitle` | INTEGER |                          | `1` if this is the original title, `0` if a variant    |

**Primary Key:** `(titleId, ordering)`

**Supported Regions:** US, GB, FR, DE, JP, KR, IT, BR, CN, IN
**Supported Languages:** en, fr, de, es, ja, ko, it, pt, zh, hi

---

### 6. `title_episode`
Episode-level metadata for TV series.

| Column          | Type    | Constraints | Description                              |
|-----------------|---------|-------------|------------------------------------------|
| `tconst`        | TEXT    | PRIMARY KEY | Episode ID (references `title_basics`)   |
| `parentTconst`  | TEXT    |             | Parent series ID (references `title_basics`) |
| `seasonNumber`  | INTEGER |             | Season number                            |
| `episodeNumber` | INTEGER |             | Episode number within the season         |

**Indexes:**
- `idx_te_parent` ON `title_episode(parentTconst)`

---

### 7. `name_basics`
People (actors, directors, writers, crew) metadata.

| Column               | Type | Constraints | Description                                         |
|----------------------|------|-------------|-----------------------------------------------------|
| `nconst`             | TEXT | PRIMARY KEY | Unique person ID (e.g., `nm0000138`)                |
| `primaryName`        | TEXT |             | Full display name                                   |
| `birthYear`          | TEXT |             | Year of birth                                       |
| `deathYear`          | TEXT |             | Year of death (`\N` if still alive)                 |
| `primaryProfession`  | TEXT |             | Comma-separated professions (e.g., `"actor,director"`) |
| `knownForTitles`     | TEXT |             | Comma-separated `tconst` IDs of notable works       |

---

## Relationships

```
title_basics (tconst)
    ├── title_ratings      (tconst → tconst)         1:1
    ├── title_crew         (tconst → tconst)         1:1
    ├── title_principals   (tconst → tconst)         1:N
    ├── title_akas         (tconst → titleId)        1:N
    └── title_episode      (parentTconst → tconst)   1:N (series → episodes)

name_basics (nconst)
    └── title_principals   (nconst → nconst)         1:N
```

---

## Seed Data (Mock)

Generated by `backend/db/seed.js`:

| Entity      | Count                                      |
|-------------|--------------------------------------------|
| People      | 100 (realistic names, e.g. Leonardo DiCaprio) |
| Titles      | 160 (movies + TV series from curated list) |
| Episodes    | Variable (1–8 seasons, 6–24 eps each)      |
| Genres      | 20 (Action, Drama, Comedy, Horror, etc.)   |
| Regions     | 10 (US, GB, FR, DE, JP, KR, IT, BR, CN, IN)|
| Languages   | 10 (en, fr, de, es, ja, ko, it, pt, zh, hi)|

---

## Route Files Using the Database

| File                               | Purpose                                                   |
|------------------------------------|-----------------------------------------------------------|
| `backend/routes/movies.js`         | Movie search, detail, analytics, similar movies, cast     |
| `backend/routes/people.js`         | Person profiles, filmography, director/actor leaderboards |
| `backend/routes/analytics.js`      | Global KPIs, genre trends, ratings, runtime, top movies   |
| `backend/routes/search.js`         | Natural language search + unified text search             |
