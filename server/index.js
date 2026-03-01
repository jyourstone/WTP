import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import categoriesRouter from './routes/categories.js';
import workoutsRouter from './routes/workouts.js';
import pushRouter from './routes/push.js';
import { startScheduler } from './scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Import db to trigger initialization and seeding
await import('./db.js');

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/categories', categoriesRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/push', pushRouter);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`WTP körs på port ${PORT}`);
  startScheduler();
});
