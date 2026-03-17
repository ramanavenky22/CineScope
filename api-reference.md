# CineScope API Reference

**Base URL:** `http://localhost:3001`  
**Data:** IMDB TSV schema (mock seed on startup when real TSV files absent)  
**Auth:** None (open for local/dev use)

---

## Table of Contents
1. [Health](#health)
2. [Movies – Search & List](#movies--search--list)
3. [Movies – Detail](#movies--detail)
4. [Movies – Cast & Crew](#movies--cast--crew)
5. [Movies – Similar](#movies--similar)
6. [Movies – Per-Movie Analytics](#movies--per-movie-analytics)
7. [Analytics – Global KPIs](#analytics--global-kpis)
8. [Analytics – Genre Breakdown](#analytics--genre-breakdown)
9. [Analytics – Year Trends](#analytics--year-trends)
10. [Analytics – Rating Analytics](#analytics--rating-analytics)
11. [Analytics – Runtime Analytics](#analytics--runtime-analytics)
12. [Analytics – Language & Region](#analytics--language--region)
13. [Analytics – Top Movies Leaderboard](#analytics--top-movies-leaderboard)
14. [People – Person Detail](#people--person-detail)
15. [People – Directors Leaderboard](#people--directors-leaderboard)
16. [People – Actors Leaderboard](#people--actors-leaderboard)
17. [Search – Unified](#search--unified)
18. [Search – Natural Language](#search--natural-language)

---

## Health

### `GET /api/health`
Server + DB status check.

**Response:**
```json
{
  "status": "ok",
  "service": "cinescope-backend",
  "dbTitles": 200
}
```

---

## Movies – Search & List

### `GET /api/movies`

Search and list movies with filters, sorting, and pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | — | Title keyword search |
| `genre` | string | — | Filter by genre (e.g. `Action`, `Sci-Fi`) |
| `titleType` | string | `movie` | `movie`, `tvSeries`, `short`, `tvMovie` |
| `startYear` | integer | — | Release year ≥ value |
| `endYear` | integer | — | Release year ≤ value |
| `minRating` | float | — | averageRating ≥ value |
| `maxRating` | float | — | averageRating ≤ value |
| `language` | string | — | ISO 639-1 language code (e.g. `en`, `fr`) |
| `region` | string | — | Region code (e.g. `US`, `GB`) |
| `sort` | string | `rating` | `rating`, `votes`, `year`, `title`, `revenue`, `runtime`, `popularity` |
| `order` | string | `desc` | `asc` or `desc` |
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Results per page (max 100) |

**Sample Request:**
```
GET /api/movies?genre=Sci-Fi&startYear=2010&minRating=7&sort=rating&limit=5
```

**Sample Response:**
```json
{
  "total": 34,
  "page": 1,
  "limit": 5,
  "totalPages": 7,
  "results": [
    {
      "tconst": "tt0000042",
      "primaryTitle": "Stellar Beyond",
      "titleType": "movie",
      "startYear": 2015,
      "runtimeMinutes": 142,
      "genres": "Sci-Fi,Action",
      "isAdult": 0,
      "budget": 85000000,
      "revenue": 412000000,
      "popularity": 78.4,
      "averageRating": 8.3,
      "numVotes": 945210
    }
  ]
}
```

---

## Movies – Detail

### `GET /api/movies/:id`

Full movie detail with resolved directors, writers, and regional titles.

**Path Parameter:** `id` — tconst (e.g. `tt0000042`)

**Sample Response:**
```json
{
  "tconst": "tt0000042",
  "titleType": "movie",
  "primaryTitle": "Stellar Beyond",
  "originalTitle": "Stellar Beyond",
  "isAdult": 0,
  "startYear": 2015,
  "endYear": "\\N",
  "runtimeMinutes": 142,
  "genres": ["Sci-Fi", "Action"],
  "budget": 85000000,
  "revenue": 412000000,
  "popularity": 78.4,
  "averageRating": 8.3,
  "numVotes": 945210,
  "directors": [
    { "nconst": "nm0000012", "primaryName": "Elena Scott", "birthYear": 1972 }
  ],
  "writers": [
    { "nconst": "nm0000031", "primaryName": "Marco Conti" }
  ],
  "akas": [
    { "title": "Stellar Beyond", "region": "US", "language": "en", "types": "original", "isOriginalTitle": 1 },
    { "title": "Stellar Beyond (GB)", "region": "GB", "language": "en", "types": "imdbDisplay", "isOriginalTitle": 0 }
  ]
}
```

---

## Movies – Cast & Crew

### `GET /api/movies/:id/cast`

Cast and crew list with each person's top 5 other movies.

**Sample Response:**
```json
{
  "tconst": "tt0000042",
  "cast": [
    {
      "ordering": 1,
      "nconst": "nm0000055",
      "category": "actor",
      "job": "\\N",
      "characters": "[\"Carter\"]",
      "primaryName": "James Anderson",
      "birthYear": 1985,
      "primaryProfession": "actor,producer",
      "otherMovies": [
        { "tconst": "tt0000018", "primaryTitle": "Iron Storm", "startYear": 2012, "genres": "Action", "averageRating": 7.1 }
      ]
    }
  ]
}
```

---

## Movies – Similar

### `GET /api/movies/:id/similar`

Similar movies based on shared genre and rating range.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | `12` | Max results |

**Sample Response:**
```json
{
  "tconst": "tt0000042",
  "similar": [
    {
      "tconst": "tt0000087",
      "primaryTitle": "Quantum Horizon",
      "startYear": 2016,
      "genres": "Sci-Fi,Thriller",
      "runtimeMinutes": 128,
      "averageRating": 7.9,
      "numVotes": 312000
    }
  ]
}
```

---

## Movies – Per-Movie Analytics

### `GET /api/movies/:id/analytics`

Deep analytics for one title: benchmarks vs genre average, year rankings, ROI.

**Sample Response:**
```json
{
  "movie": {
    "tconst": "tt0000042",
    "primaryTitle": "Stellar Beyond",
    "startYear": 2015,
    "genres": "Sci-Fi,Action",
    "runtimeMinutes": 142,
    "budget": 85000000,
    "revenue": 412000000,
    "popularity": 78.4,
    "averageRating": 8.3,
    "numVotes": 945210
  },
  "benchmarks": {
    "genreAvg": {
      "avgRating": 6.9,
      "avgRuntime": 118,
      "avgRevenue": 95000000,
      "totalInGenre": 34
    },
    "yearAvg": {
      "avgRating": 6.8,
      "avgPopularity": 41.2
    },
    "ratingVsGenreAvg": 1.4,
    "ratingVsYearAvg": 1.5,
    "runtimeVsGenreAvg": 24,
    "revenueVsGenreAvg": 317000000
  },
  "rankings": {
    "yearRankByRating": 3,
    "genreYearRankByRevenue": 1
  },
  "financials": {
    "budget": 85000000,
    "revenue": 412000000,
    "profit": 327000000,
    "roi": 3.85,
    "roiCategory": "High"
  }
}
```

**`roiCategory` values:** `High` (≥2x), `Medium` (≥0.5x), `Low` (≥0x), `Loss` (<0x), `null` (no data)

---

## Analytics – Global KPIs

### `GET /api/analytics/kpi`

Global dashboard summary stats.

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `titleType` | string | `movie` |

**Sample Response:**
```json
{
  "totalMovies": 200,
  "avgRating": 6.82,
  "avgRuntime": 113,
  "totalRevenue": 18420000000,
  "totalBudget": 9800000000,
  "earliestYear": 2000,
  "latestYear": 2025,
  "topGenre": "Drama",
  "topLanguage": "en",
  "totalVotes": 48200000,
  "maxVotes": 1980000
}
```

---

## Analytics – Genre Breakdown

### `GET /api/analytics/genres`

Per-genre: count, average rating, average runtime, total/avg revenue, votes.

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `titleType` | string | `movie` |

**Sample Response:**
```json
[
  {
    "genre": "Drama",
    "movieCount": 48,
    "avgRating": 7.12,
    "avgRuntime": 112,
    "totalRevenue": 3100000000,
    "avgRevenue": 64583333,
    "totalVotes": 8400000,
    "maxRating": 9.1,
    "minRating": 3.2
  },
  {
    "genre": "Action",
    "movieCount": 41,
    "avgRating": 6.55,
    "avgRuntime": 121,
    "totalRevenue": 5200000000,
    "avgRevenue": 126829268,
    "totalVotes": 12100000,
    "maxRating": 8.7,
    "minRating": 2.8
  }
]
```
*Results sorted by `movieCount` descending.*

---

## Analytics – Year Trends

### `GET /api/analytics/trends`

Year-by-year movie count, average rating, average runtime, revenue.

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `titleType` | string | `movie` |
| `startYear` | integer | `2000` |

**Sample Response:**
```json
[
  { "year": 2020, "movieCount": 12, "avgRating": 6.91, "avgRuntime": 109, "totalRevenue": 820000000, "avgRevenue": 68333333, "totalVotes": 4100000 },
  { "year": 2021, "movieCount": 14, "avgRating": 7.02, "avgRuntime": 111, "totalRevenue": 940000000, "avgRevenue": 67142857, "totalVotes": 4800000 }
]
```

---

## Analytics – Rating Analytics

### `GET /api/analytics/ratings`

Rating histogram (0.5-step buckets), avg rating by year, by genre, high/mid/low counts.

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `titleType` | string | `movie` |

**Sample Response:**
```json
{
  "histogram": [
    { "bucket": 4.5, "count": 8 },
    { "bucket": 5.0, "count": 14 },
    { "bucket": 6.0, "count": 31 },
    { "bucket": 7.0, "count": 52 },
    { "bucket": 7.5, "count": 38 },
    { "bucket": 8.0, "count": 21 }
  ],
  "byYear": [
    { "year": 2020, "avgRating": 6.91, "count": 12 }
  ],
  "byGenre": [
    { "genre": "Drama,Romance", "avgRating": 7.38, "count": 8 }
  ],
  "thresholdStats": {
    "highRated": 89,
    "midRated": 78,
    "lowRated": 33
  }
}
```

---

## Analytics – Runtime Analytics

### `GET /api/analytics/runtime`

Runtime distribution, by genre, runtime vs rating correlation.

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `titleType` | string | `movie` |

**Sample Response:**
```json
{
  "stats": { "avgRuntime": 113, "minRuntime": 71, "maxRuntime": 198 },
  "distribution": [
    { "bucketStart": 75, "count": 6 },
    { "bucketStart": 90, "count": 18 },
    { "bucketStart": 105, "count": 42 }
  ],
  "byGenre": [
    { "genre": "Drama", "avgRuntime": 112, "count": 48 },
    { "genre": "Action", "avgRuntime": 121, "count": 41 }
  ],
  "vsRating": [
    { "runtimeBucket": 90, "avgRating": 6.3, "count": 18 },
    { "runtimeBucket": 120, "avgRating": 7.1, "count": 42 }
  ]
}
```

---

## Analytics – Language & Region

### `GET /api/analytics/languages`

Movie counts and average ratings by language and by region.

**Sample Response:**
```json
{
  "byLanguage": [
    { "language": "en", "movieCount": 124, "avgRating": 6.9 },
    { "language": "fr", "movieCount": 31, "avgRating": 7.1 }
  ],
  "byRegion": [
    { "region": "US", "movieCount": 98, "avgRating": 6.8 },
    { "region": "GB", "movieCount": 44, "avgRating": 7.0 }
  ]
}
```

---

## Analytics – Top Movies Leaderboard

### `GET /api/analytics/top-movies`

Four ranked lists: top rated, most voted, highest revenue, best ROI.

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `titleType` | string | `movie` |
| `limit` | integer | `50` |

**Sample Response:**
```json
{
  "topRated": [
    { "tconst": "tt0000042", "primaryTitle": "Stellar Beyond", "startYear": 2015, "genres": "Sci-Fi,Action", "averageRating": 8.3, "numVotes": 945210, "revenue": 412000000 }
  ],
  "mostVoted": [
    { "tconst": "tt0000107", "primaryTitle": "Iron Thunder", "startYear": 2018, "genres": "Action", "averageRating": 7.1, "numVotes": 1980000 }
  ],
  "highestRevenue": [
    { "tconst": "tt0000042", "primaryTitle": "Stellar Beyond", "startYear": 2015, "budget": 85000000, "revenue": 412000000, "averageRating": 8.3 }
  ],
  "bestROI": [
    { "tconst": "tt0000089", "primaryTitle": "Beyond Silence", "startYear": 2011, "budget": 3000000, "revenue": 41000000, "roi": 12.67, "averageRating": 7.4 }
  ]
}
```

---

## People – Person Detail

### `GET /api/people/:id`

Person detail with filmography and directed credits.

**Path Parameter:** `id` — nconst (e.g. `nm0000012`)

**Sample Response:**
```json
{
  "nconst": "nm0000012",
  "primaryName": "Elena Scott",
  "birthYear": "1972",
  "deathYear": "\\N",
  "primaryProfession": ["director", "writer"],
  "knownForTitles": [
    { "tconst": "tt0000042", "primaryTitle": "Stellar Beyond", "startYear": 2015, "genres": "Sci-Fi,Action", "averageRating": 8.3 }
  ],
  "filmography": [
    { "tconst": "tt0000042", "primaryTitle": "Stellar Beyond", "startYear": 2015, "genres": "Sci-Fi,Action", "titleType": "movie", "averageRating": 8.3, "numVotes": 945210, "category": "director", "characters": "\\N" }
  ],
  "directed": [
    { "tconst": "tt0000042", "primaryTitle": "Stellar Beyond", "startYear": 2015, "genres": "Sci-Fi,Action", "averageRating": 8.3, "numVotes": 945210, "revenue": 412000000 }
  ]
}
```

---

## People – Directors Leaderboard

### `GET /api/analytics/directors`

Top directors ranked by average rating across their films.

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `limit` | integer | `20` |
| `minMovies` | integer | `2` |

**Sample Response:**
```json
[
  {
    "nconst": "nm0000012",
    "primaryName": "Elena Scott",
    "birthYear": "1972",
    "movieCount": 7,
    "avgRating": 8.1,
    "maxRating": 8.8,
    "totalRevenue": 1840000000
  }
]
```

---

## People – Actors Leaderboard

### `GET /api/analytics/actors`

Top actors/actresses ranked by movie count.

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `limit` | integer | `20` |
| `minMovies` | integer | `2` |

**Sample Response:**
```json
[
  {
    "nconst": "nm0000055",
    "primaryName": "James Anderson",
    "birthYear": "1985",
    "movieCount": 12,
    "avgRating": 7.2,
    "bestRating": 9.1,
    "category": "actor"
  }
]
```

---

## Search – Unified

### `GET /api/search?q=<query>`

Search across movies and people simultaneously.

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `q` | string | *(required)* | Search term |
| `limit` | integer | `10` | Max results per category |

**Sample Request:**
```
GET /api/search?q=Nolan&limit=5
```

**Sample Response:**
```json
{
  "query": "Nolan",
  "movies": [
    { "tconst": "tt0000042", "name": "Beyond Nolan's Reach", "type": "movie", "startYear": 2018, "genres": "Thriller", "averageRating": 7.4 }
  ],
  "people": [
    { "id": "nm0000031", "name": "James Nolan", "type": "person", "primaryProfession": "director,writer", "birthYear": "1968" }
  ]
}
```

---

## Search – Natural Language

### `POST /api/search/natural`

Parse a free-text query into structured filters, execute, and return results with insights.

**Request Body:**
```json
{
  "query": "sci-fi movies after 2015 with rating above 7.5",
  "limit": 20
}
```

**Supported NL Patterns:**
| Pattern | Example |
|---------|---------|
| Genre | `action`, `sci-fi`, `romantic comedy` |
| Year range | `after 2010`, `before 2005`, `in 2019`, `1990s` |
| Min rating | `rating above 7`, `rating over 8` |
| Quality hint | `top rated`, `best`, `highest rated` |
| Popularity | `most popular`, `most voted` |
| Recency | `recent`, `latest`, `newest` |
| Revenue | `highest grossing`, `box office` |
| Director | `directed by Nolan`, `by Spielberg` |
| Type | `TV series`, `TV show` |

**Sample Response:**
```json
{
  "query": "sci-fi movies after 2015 with rating above 7.5",
  "parsedFilters": {
    "genre": "sci-fi",
    "startYear": 2015,
    "minRating": 7.5,
    "titleType": "movie",
    "sort": "rating",
    "order": "desc"
  },
  "insights": [
    "Genre: Sci-Fi",
    "After 2015",
    "Min rating: 7.5",
    "Sorted by rating"
  ],
  "resultSummary": {
    "count": 18,
    "avgRating": 8.1,
    "topGenre": "Sci-Fi"
  },
  "results": [
    {
      "tconst": "tt0000042",
      "primaryTitle": "Stellar Beyond",
      "titleType": "movie",
      "startYear": 2015,
      "genres": "Sci-Fi,Action",
      "runtimeMinutes": 142,
      "budget": 85000000,
      "revenue": 412000000,
      "popularity": 78.4,
      "averageRating": 8.3,
      "numVotes": 945210
    }
  ]
}
```

---

## Database Schema Reference

### `title_basics` (extended)
| Column | Type | Notes |
|--------|------|-------|
| `tconst` | TEXT PK | e.g. `tt0000042` |
| `titleType` | TEXT | `movie`, `tvSeries`, `short`, `tvMovie` |
| `primaryTitle` | TEXT | |
| `originalTitle` | TEXT | |
| `isAdult` | INTEGER | 0 or 1 |
| `startYear` | INTEGER | |
| `endYear` | TEXT | `\N` for non-series |
| `runtimeMinutes` | INTEGER | |
| `genres` | TEXT | comma-separated |
| `budget` | INTEGER | *Extended – not in IMDB* |
| `revenue` | INTEGER | *Extended – not in IMDB* |
| `popularity` | REAL | *Extended – not in IMDB* |

### `title_ratings`
| Column | Type |
|--------|------|
| `tconst` | TEXT PK |
| `averageRating` | REAL |
| `numVotes` | INTEGER |

### `title_crew`
| Column | Type |
|--------|------|
| `tconst` | TEXT PK |
| `directors` | TEXT (comma-sep nconsts) |
| `writers` | TEXT (comma-sep nconsts) |

### `title_principals`
| Column | Type |
|--------|------|
| `tconst` | TEXT |
| `ordering` | INTEGER |
| `nconst` | TEXT |
| `category` | TEXT |
| `job` | TEXT |
| `characters` | TEXT |

### `title_akas`
| Column | Type |
|--------|------|
| `titleId` | TEXT |
| `ordering` | INTEGER |
| `title` | TEXT |
| `region` | TEXT |
| `language` | TEXT |
| `types` | TEXT |
| `attributes` | TEXT |
| `isOriginalTitle` | INTEGER |

### `title_episode`
| Column | Type |
|--------|------|
| `tconst` | TEXT PK |
| `parentTconst` | TEXT |
| `seasonNumber` | INTEGER |
| `episodeNumber` | INTEGER |

### `name_basics`
| Column | Type |
|--------|------|
| `nconst` | TEXT PK |
| `primaryName` | TEXT |
| `birthYear` | TEXT |
| `deathYear` | TEXT |
| `primaryProfession` | TEXT (comma-sep) |
| `knownForTitles` | TEXT (comma-sep tconsts) |

---

## Error Responses

All errors follow this format:
```json
{ "error": "Human-readable error message" }
```

| Status | Meaning |
|--------|---------|
| 400 | Missing required parameter |
| 404 | Resource not found |
| 500 | Internal server error |
