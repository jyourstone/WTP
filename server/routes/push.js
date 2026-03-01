import { Router } from 'express';
import db from '../db.js';
import { getPublicKey, isConfigured, sendToAll } from '../push.js';

const router = Router();

router.get('/vapid-key', (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({ error: 'Push-notiser ej konfigurerade.' });
  }
  res.json({ publicKey: getPublicKey() });
});

router.post('/subscribe', (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Ogiltig prenumeration.' });
  }

  const existing = db.prepare('SELECT id FROM push_subscriptions WHERE endpoint = ?').get(endpoint);
  if (existing) {
    db.prepare('UPDATE push_subscriptions SET p256dh = ?, auth = ? WHERE endpoint = ?')
      .run(keys.p256dh, keys.auth, endpoint);
  } else {
    db.prepare('INSERT INTO push_subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?)')
      .run(endpoint, keys.p256dh, keys.auth);
  }

  res.status(201).json({ ok: true });
});

router.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint krävs.' });
  }
  db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(endpoint);
  res.json({ ok: true });
});

router.post('/test', async (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({ error: 'Push-notiser ej konfigurerade.' });
  }
  const result = await sendToAll({
    title: 'Testnotis',
    body: 'Push-notiser fungerar!',
  });
  res.json(result);
});

export default router;
