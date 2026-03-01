# CLAUDE.md

## What

WTP (Workout Training Planner) is a PWA for tracking workouts on iPhone. Vanilla JS frontend (ES6 modules, no framework), Express + SQLite backend. All UI text is in Swedish.

## Structure

- `server/` - Express API with `better-sqlite3`. Routes in `server/routes/`. Database schema and seeds in `server/db.js`.
- `public/` - Static SPA. Modular JS in `public/js/`, CSS in `public/css/`. Service worker in `public/sw.js`.
- State management via observable store in `public/js/state.js` (subscribe/set pattern).

## How

```bash
npm run dev     # Start with auto-reload (port 3000)
npm start       # Production start
```

No build step. No test suite. No linter. Files are served directly from `public/`.

## Key Conventions

- All user-facing strings are in Swedish
- Dark theme only (CSS variables in `main.css :root`)
- Database path configurable via `DB_PATH` env var, defaults to `data/wtp.db`
- Service worker cache version in `public/sw.js` (CACHE_VERSION) must be bumped when static assets change
- Docker image published to GHCR on push to `main`
