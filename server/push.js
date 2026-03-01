import webPush from 'web-push';
import db from './db.js';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:wtp@example.com';

let configured = false;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
} else {
  console.warn('VAPID-nycklar saknas. Push-notiser inaktiverade.');
}

export function isConfigured() {
  return configured;
}

export function getPublicKey() {
  return VAPID_PUBLIC_KEY;
}

export async function sendToAll(payload) {
  if (!configured) return { sent: 0, failed: 0 };

  const subs = db.prepare('SELECT * FROM push_subscriptions').all();
  const payloadStr = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    const pushSub = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };
    try {
      await webPush.sendNotification(pushSub, payloadStr);
      sent++;
    } catch (err) {
      failed++;
      if (err.statusCode === 404 || err.statusCode === 410) {
        db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(sub.endpoint);
      }
    }
  }
  return { sent, failed };
}
