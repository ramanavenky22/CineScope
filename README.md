# CineScope

A full-stack movie analytics and discovery platform powered by IMDB data. Browse and search movies, explore genre breakdowns, year-over-year trends, people leaderboards, and a natural language search interface.

## Problem and Idea

Movie data is massive and hard to explore with simple list UIs. CineScope addresses this by combining:
- a movie discovery interface,
- analytics dashboards for trends and comparisons,
- and natural-language search for faster query building.

## Project Requirement Alignment

This repository is prepared to satisfy presentation requirements:
- Working implementation (frontend + backend)
- Organized structure (`frontend/`, `backend/`, docs)
- Incremental commit history (small, traceable check-ins)
- README coverage for:
  - problem and idea,
  - key technical choices,
  - run instructions

## Tech Stack

- **Backend**: Node.js + Express + SQLite (better-sqlite3)
- **Frontend**: React 19 + TypeScript + Vite + Recharts
- **Database**: SQLite with WAL mode, IMDB-compatible schema

## Key Technical Choices

- **Express + SQLite API backend** for fast local analytics and simple deployment flow
- **React + TypeScript frontend** for maintainable component architecture
- **Vite tooling** for quick dev/build feedback loops
- **Gemini-powered natural-language search** (`gemini-2.5-flash`) that turns user prompts into SQL and returns ranked results

---

## Project Structure

```
CineScope/
├── backend/
│   ├── index.js          # Express server (port 3001)
│   ├── db/
│   │   ├── loader.js     # DB init — loads TSV files or falls back to mock data
│   │   └── seed.js       # Mock data generator (200 movies, 100 directors, 150 actors)
│   └── routes/
│       ├── movies.js     # Movie listing, details, cast, similar
│       ├── analytics.js  # KPIs, genre stats, trends, leaderboards
│       ├── people.js     # Director/actor profiles & filmographies
│       └── search.js     # Unified search + natural language parsing
├── frontend/
│   └── src/
│       ├── pages/        # Dashboard, Movies, Analytics, AI Search, People, Saved
│       ├── components/   # Layout, charts, movie cards, search panel
│       ├── api/          # Typed API client
│       └── types/        # TypeScript interfaces
├── data/                 # Place IMDB TSV files here (see below)
└── api-reference.md      # Full API endpoint documentation
```

---

## How to Run

### Prerequisites

- Node.js 20+
- npm

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The API server starts at `http://localhost:3001`.

### 2. Start the Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`.
Frontend API calls use `http://localhost:3001` by default (configured in `frontend/src/api/client.ts`).
Set `VITE_API_BASE_URL` in `frontend/.env.local` (or `.env`) to override this for remote backends.

### Environment Variables

Create `backend/.env`:

```bash
GEMINI_API_KEY=your_key_here
```

Optional backend variables:

```bash
PORT=3001
NODE_ENV=development
```

---

## Mock Data (No Download Required)

If no IMDB data files are found in the `data/` folder, the backend automatically generates realistic mock data on first startup. No configuration needed.

**Mock data includes:**
- 200 movies/series across genres (2000–2025)
- 100 directors and 150 actors/actresses
- Randomized ratings (1.5–9.8), budgets ($1M–$250M), revenue figures
- Cast, crew, and regional title variants (AKAs)

This lets you run the full app and explore all features without any external data.

---

## Using Real IMDB Data

For a production-quality dataset with millions of titles, download the official IMDB data files.

### Download

Go to: **https://datasets.imdbws.com/**

Download the following files:

| File | Description |
|------|-------------|
| `title.basics.tsv.gz` | Movie/series titles, genres, year |
| `title.ratings.tsv.gz` | Average ratings and vote counts |
| `title.crew.tsv.gz` | Directors and writers per title |
| `title.principals.tsv.gz` | Main cast and crew per title |
| `title.akas.tsv.gz` | Regional/alternate titles |
| `title.episode.tsv.gz` | TV episode metadata |
| `name.basics.tsv.gz` | Person names, birth years, known titles |

### Setup

1. Decompress each `.gz` file to get the `.tsv` files.
2. Place all `.tsv` files in the `data/` folder at the root of this project:

```
CineScope/
└── data/
    ├── title.basics.tsv
    ├── title.ratings.tsv
    ├── title.crew.tsv
    ├── title.principals.tsv
    ├── title.akas.tsv
    ├── title.episode.tsv
    └── name.basics.tsv
```

3. Start (or restart) the backend. It will detect the files and load them automatically in batches.

> **Note:** The full dataset is large (several GB). Initial load may take a few minutes. The database file (`backend/db/cinescope.db`) is created once and reused on subsequent starts.

---

## Features

- **Dashboard** — KPI cards, genre breakdown, yearly trends, top movies table, and search results analytics panel
- **Movies** — Grid/list browse with filters (genre, year range, rating, sort), real poster images, and compare option
- **Movie Detail** — Cast, crew, similar titles, benchmark analytics, AI insight summary, and recommendation explanations
- **Analytics** — Genre stats, year-over-year trends, rating distribution, and aggregated search insights
- **People** — Top directors and actors with filmographies
- **AI Search** — Natural language queries (e.g. *"sci-fi movies from the 2010s with rating above 7.5"*) with detailed analytics output
- **Comparison** — Side-by-side comparison (up to 3 movies) with metrics table, radar chart, revenue chart, and insights
- **Personalization** — Watchlist/favorites with localStorage persistence
- **Dark/Light Mode** — Toggle-able theme throughout the app

---

## API

The backend exposes a REST API. See [`api-reference.md`](./api-reference.md) for the full endpoint reference.

Key base URL: `http://localhost:3001/api`
