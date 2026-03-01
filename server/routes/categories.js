import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/categories
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order, id').all();
  res.json({ categories });
});

// POST /api/categories
router.post('/', (req, res) => {
  const { name, color } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Namn krävs.' });
  }
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) {
    return res.status(400).json({ error: 'Ogiltig färgkod.' });
  }
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM categories').get();
  const result = db.prepare(
    'INSERT INTO categories (name, color, sort_order) VALUES (?, ?, ?)'
  ).run(name.trim(), color, maxOrder.max_order + 1);
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ category });
});

// PUT /api/categories/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Kategorin hittades inte.' });
  }
  const name = req.body.name !== undefined ? req.body.name.trim() : existing.name;
  const color = req.body.color !== undefined ? req.body.color : existing.color;
  if (!name) {
    return res.status(400).json({ error: 'Namn krävs.' });
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return res.status(400).json({ error: 'Ogiltig färgkod.' });
  }
  db.prepare(
    "UPDATE categories SET name = ?, color = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(name, color, id);
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  res.json({ category });
});

// DELETE /api/categories/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Kategorin hittades inte.' });
  }
  const workoutCount = db.prepare('SELECT COUNT(*) AS cnt FROM workouts WHERE category_id = ?').get(id);
  if (workoutCount.cnt > 0) {
    return res.status(409).json({
      error: `Kategorin har ${workoutCount.cnt} träningspass kopplade. Ta bort dem först.`
    });
  }
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.status(204).end();
});

export default router;
