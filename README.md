# WTP - Workout Training Planner

A lightweight PWA for planning and tracking workouts. Built with vanilla JavaScript and designed for mobile-first use on iPhone.

## Tech Stack

- **Frontend**: Vanilla ES6 modules, CSS3, Service Worker for offline support
- **Backend**: Express.js, better-sqlite3
- **Runtime**: Node.js 22
- **Deployment**: Docker, GitHub Actions (GHCR)

## Getting Started

### Local Development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000` with auto-reload on file changes.

### Docker

```bash
docker compose up -d
```

## Project Structure

```
server/
  index.js          Express app setup and SPA fallback
  db.js             SQLite schema, migrations, and seed data
  routes/
    categories.js   GET/POST/PUT/DELETE /api/categories
    workouts.js     GET/POST/PUT/PATCH/DELETE /api/workouts

public/
  index.html        Single-page app shell
  manifest.json     PWA manifest
  sw.js             Service worker (cache-first static, network-first API)
  icons/            Favicons and apple-touch-icon
  css/
    main.css        Global styles, dark theme variables, layout
    calendar.css    Calendar grid and date cell indicators
    modal.css       Bottom-sheet modal dialogs
    animations.css  Celebration confetti and transitions
  js/
    app.js          Entry point, event wiring, service worker registration
    state.js        Observable state store (categories, workouts, view mode)
    api.js          HTTP client for all backend endpoints
    calendar.js     Month/week grid rendering and navigation
    dateCell.js     Date cell indicators (concentric colored rings)
    modal.js        Modal open/close management
    workoutForm.js  Create/edit workout forms
    workoutDetail.js  Day detail view with completion toggle
    categoryManager.js  Category CRUD with color picker
    summary.js      Collapsible stats panel (per-category completion rates)
    celebrate.js    Confetti particle animation on workout completion
    utils.js        Swedish date formatting and calendar math
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category (fails if workouts linked) |
| GET | `/api/workouts?from=&to=` | List workouts in date range |
| GET | `/api/workouts/summary?from=&to=` | Aggregated stats by category |
| POST | `/api/workouts` | Create workout |
| PUT | `/api/workouts/:id` | Update workout |
| PATCH | `/api/workouts/:id/complete` | Toggle completion |
| DELETE | `/api/workouts/:id` | Delete workout |

## Deployment

Pushing to `main` triggers a GitHub Actions workflow that builds and publishes a Docker image to `ghcr.io/jyourstone/wtp:latest`.

### Unraid / Docker Setup

| Setting | Value |
|---------|-------|
| Image | `ghcr.io/jyourstone/wtp:latest` |
| Port | `3000` |
| Volume | `/app/data` (SQLite database) |
| Env | `NODE_ENV=production` |
