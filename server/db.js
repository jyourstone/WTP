import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'traningskalender.db');
const db = new Database(dbPath);

// Enable WAL mode and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    color      TEXT    NOT NULL DEFAULT '#6366f1',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    category_id INTEGER NOT NULL,
    notes       TEXT    NOT NULL DEFAULT '',
    completed   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
  );

  CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
  CREATE INDEX IF NOT EXISTS idx_workouts_category ON workouts(category_id);
`);

// Seed default categories if table is empty
const count = db.prepare('SELECT COUNT(*) AS cnt FROM categories').get();
if (count.cnt === 0) {
  const insert = db.prepare('INSERT INTO categories (name, color, sort_order) VALUES (?, ?, ?)');
  const defaults = [
    ['Löpning',   '#ef4444', 0],
    ['Gym',       '#3b82f6', 1],
    ['Gruppass',  '#a855f7', 2],
    ['Promenad',  '#22c55e', 3],
    ['Hemmapass', '#f59e0b', 4],
  ];
  const seedAll = db.transaction(() => {
    for (const [name, color, order] of defaults) {
      insert.run(name, color, order);
    }
  });
  seedAll();
}

export default db;
