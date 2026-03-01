import { showToast } from './app.js';

let bellBtn = null;
let isSubscribed = false;
let swRegistration = null;

export async function init(registration) {
  swRegistration = registration;

  if (!('PushManager' in window)) return;
  if (!registration) return;

  try {
    const res = await fetch('/api/push/vapid-key');
    if (!res.ok) return;
  } catch {
    return;
  }

  bellBtn = document.createElement('button');
  bellBtn.className = 'header__icon-btn';
  bellBtn.id = 'btn-notifications';
  bellBtn.setAttribute('aria-label', 'Notiser');
  bellBtn.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  `;
  bellBtn.addEventListener('click', toggleSubscription);

  const categoriesBtn = document.getElementById('btn-categories');
  categoriesBtn.parentNode.insertBefore(bellBtn, categoriesBtn);

  const sub = await registration.pushManager.getSubscription();
  isSubscribed = !!sub;
  updateBellUI();
}

async function toggleSubscription() {
  if (isSubscribed) {
    await unsubscribe();
  } else {
    await subscribe();
  }
}

async function subscribe() {
  try {
    const res = await fetch('/api/push/vapid-key');
    const { publicKey } = await res.json();
    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    const sub = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    const saveRes = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    });

    if (!saveRes.ok) throw new Error('Kunde inte spara prenumeration.');

    isSubscribed = true;
    updateBellUI();
    showToast('Notiser aktiverade');
  } catch (err) {
    if (Notification.permission === 'denied') {
      showToast('Notiser blockerade i inställningar.');
    } else {
      showToast('Kunde inte aktivera notiser.');
    }
  }
}

async function unsubscribe() {
  try {
    const sub = await swRegistration.pushManager.getSubscription();
    if (sub) {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }

    isSubscribed = false;
    updateBellUI();
    showToast('Notiser inaktiverade');
  } catch {
    showToast('Kunde inte inaktivera notiser.');
  }
}

function updateBellUI() {
  if (!bellBtn) return;
  bellBtn.classList.toggle('header__icon-btn--active', isSubscribed);
  bellBtn.setAttribute('aria-label', isSubscribed ? 'Inaktivera notiser' : 'Aktivera notiser');
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
