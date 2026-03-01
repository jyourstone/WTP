import db from './db.js';
import { isConfigured, sendToAll } from './push.js';

const NOTIFY_TIME = process.env.NOTIFY_TIME || '07:00';

let lastSentDate = null;

export function startScheduler() {
  if (!isConfigured()) {
    console.log('Push ej konfigurerat — schemaläggaren startar inte.');
    return;
  }

  const [hours, minutes] = NOTIFY_TIME.split(':').map(Number);
  console.log(`Notis-schemaläggare aktiv. Skickar kl ${NOTIFY_TIME}.`);

  setInterval(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (lastSentDate === todayStr) return;

    if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)) {
      lastSentDate = todayStr;
      checkAndNotify(todayStr);
    }
  }, 60_000);
}

async function checkAndNotify(todayStr) {
  const workouts = db.prepare(`
    SELECT w.title, c.name AS category_name
    FROM workouts w
    JOIN categories c ON w.category_id = c.id
    WHERE w.date = ? AND w.completed = 0
    ORDER BY w.created_at
  `).all(todayStr);

  if (workouts.length === 0) return;

  const titles = workouts.map(w => w.title).join(', ');
  const body = workouts.length === 1
    ? `Du har ett planerat pass idag: ${titles}`
    : `Du har ${workouts.length} planerade pass idag: ${titles}`;

  await sendToAll({
    title: 'Dagens träning',
    body,
    url: '/',
  });
}
