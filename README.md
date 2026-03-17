# CineScope

Movie Analytics Dashboard (React SPA) hackathon project.

## Tech stack

- **React 18 + TypeScript** (SPA)
- **Vite** (dev/build)
- **Node.js + Express** (lightweight API server on `/api`)
- **React Router** (client-side routing)
- **MUI** (UI components + theming with dark/light mode)
- **Recharts** (dashboard visualizations)
- **Vitest + Testing Library** (tests)
- **Sentry** (optional error monitoring)
- **GitHub Actions** (CI)

## Getting started

```bash
npm install
npm run dev:full
```

Then open the local URL printed by the dev server (by default `http://127.0.0.1:5173`). This runs:

- Express API on `http://localhost:3001` (serving `/api/movies`)
- Vite dev server on `http://127.0.0.1:5173` (proxying `/api` to the backend)

## Environment variables

Copy `.env.example` to `.env.local` and fill what you need.

- **`VITE_SENTRY_DSN`**: optional; if set, Sentry is enabled.

## Scripts

- **`npm run dev`**: start frontend dev server only
- **`npm run server`**: start Express API only
- **`npm run dev:full`**: run frontend + backend together (recommended for dev)
- **`npm run build`**: production build
- **`npm run preview`**: preview production build
- **`npm run lint`**: lint TypeScript/React files
- **`npm test -- --run`**: run unit tests once (CI-friendly)

## Deploy

- **Vercel**: import the repo, set framework to Vite (auto-detected), build command `npm run build`, output `dist`.
- **Netlify**: build command `npm run build`, publish directory `dist`.

## Project notes

The dashboard is wired around a shared filter state (search/genre/year range). Charts, the table, and the AI chat panel all react to the same filter context.