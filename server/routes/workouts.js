import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/workouts?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Parametrarna "from" och "to" krävs.' });
  }
  const workouts = db.prepare(`
    SELECT w.*, c.name AS category_name, c.color AS category_color
    FROM workouts w
    JOIN categories c ON w.category_id = c.id
    WHERE w.date BETWEEN ? AND ?
    ORDER BY w.date, w.created_at
  `).all(from, to);
  res.json({ workouts });
});

// GET /api/workouts/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/summary', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Parametrarna "from" och "to" krävs.' });
  }
  const summary = db.prepare(`
    SELECT
      c.id AS category_id,
      c.name,
      c.color,
      COUNT(w.id) AS total,
      SUM(w.completed) AS completed
    FROM workouts w
    JOIN categories c ON w.category_id = c.id
    WHERE w.date BETWEEN ? AND ?
    GROUP BY c.id
    ORDER BY c.sort_order
  `).all(from, to);
  const totals = summary.reduce((acc, s) => {
    acc.total += s.total;
    acc.completed += s.completed;
    return acc;
  }, { total: 0, completed: 0 });
  res.json({ summary, totals });
});

// POST /api/workouts
router.post('/', (req, res) => {
  const { date, title, category_id, notes } = req.body;
  if (!date || !title || !title.trim() || !category_id) {
    return res.status(400).json({ error: 'Datum, titel och kategori krävs.' });
  }
  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
  if (!category) {
    return res.status(400).json({ error: 'Ogiltig kategori.' });
  }
  const result = db.prepare(
    'INSERT INTO workouts (date, title, category_id, notes) VALUES (?, ?, ?, ?)'
  ).run(date, title.trim(), category_id, (notes || '').trim());
  const workout = db.prepare(`
    SELECT w.*, c.name AS category_name, c.color AS category_color
    FROM workouts w
    JOIN categories c ON w.category_id = c.id
    WHERE w.id = ?
  `).get(result.lastInsertRowid);
  res.status(201).json({ workout });
});

// PUT /api/workouts/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM workouts WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Träningspasset hittades inte.' });
  }
  const title = req.body.title !== undefined ? req.body.title.trim() : existing.title;
  const date = req.body.date !== undefined ? req.body.date : existing.date;
  const category_id = req.body.category_id !== undefined ? req.body.category_id : existing.category_id;
  const notes = req.body.notes !== undefined ? req.body.notes.trim() : existing.notes;
  if (!title) {
    return res.status(400).json({ error: 'Titel krävs.' });
  }
  if (category_id !== existing.category_id) {
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!category) {
      return res.status(400).json({ error: 'Ogiltig kategori.' });
    }
  }
  db.prepare(
    "UPDATE workouts SET date = ?, title = ?, category_id = ?, notes = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(date, title, category_id, notes, id);
  const workout = db.prepare(`
    SELECT w.*, c.name AS category_name, c.color AS category_color
    FROM workouts w
    JOIN categories c ON w.category_id = c.id
    WHERE w.id = ?
  `).get(id);
  res.json({ workout });
});

// PATCH /api/workouts/:id/complete
router.patch('/:id/complete', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM workouts WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Träningspasset hittades inte.' });
  }
  const completed = req.body.completed ? 1 : 0;
  db.prepare(
    "UPDATE workouts SET completed = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(completed, id);
  const workout = db.prepare(`
    SELECT w.*, c.name AS category_name, c.color AS category_color
    FROM workouts w
    JOIN categories c ON w.category_id = c.id
    WHERE w.id = ?
  `).get(id);
  res.json({ workout });
});

// DELETE /api/workouts/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM workouts WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Träningspasset hittades inte.' });
  }
  db.prepare('DELETE FROM workouts WHERE id = ?').run(id);
  res.status(204).end();
});

export default router;
