import * as state from './state.js';
import * as apiClient from './api.js';
import * as calendar from './calendar.js';
import * as modalModule from './modal.js';
import * as summaryModule from './summary.js';
import { openDayDetail } from './workoutDetail.js';
import { openCategoryManager } from './categoryManager.js';
import { loadWorkouts } from './state.js';

// Toast
let toastEl;
let toastTimer;

export function showToast(message) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('toast--visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('toast--visible');
  }, 2500);
}

// Main initialization
async function init() {
  modalModule.init();
  summaryModule.init();

  // Load categories
  try {
    const data = await apiClient.getCategories();
    state.set('categories', data.categories);
  } catch (err) {
    showToast('Kunde inte ladda kategorier.');
  }

  // Calendar
  const calendarEl = document.getElementById('calendar');
  calendar.init(calendarEl, handleDateClick);

  // Load initial workouts
  await fetchWorkouts();

  // Navigation
  document.getElementById('btn-prev').addEventListener('click', () => {
    calendar.navigatePrev();
    fetchWorkouts();
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    calendar.navigateNext();
    fetchWorkouts();
  });

  document.getElementById('btn-today').addEventListener('click', () => {
    calendar.goToday();
    fetchWorkouts();
  });

  // View toggle
  document.getElementById('btn-month').addEventListener('click', () => setView('month'));
  document.getElementById('btn-week').addEventListener('click', () => setView('week'));

  // Category manager
  document.getElementById('btn-categories').addEventListener('click', openCategoryManager);

  // Update title on state changes
  state.subscribe('currentDate', updateTitle);
  state.subscribe('viewMode', updateTitle);
  updateTitle();

  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch {
      // SW registration failed, app still works
    }
  }
}

function updateTitle() {
  document.getElementById('header-title').textContent = calendar.getTitle();
}

function setView(mode) {
  state.set('viewMode', mode);
  document.getElementById('btn-month').classList.toggle('view-btn--active', mode === 'month');
  document.getElementById('btn-week').classList.toggle('view-btn--active', mode === 'week');
  fetchWorkouts();
}

async function fetchWorkouts() {
  const { from, to } = calendar.getDateRange();
  try {
    const data = await apiClient.getWorkouts(from, to);
    loadWorkouts(data.workouts);
  } catch (err) {
    showToast('Kunde inte ladda träningspass.');
  }
}

function handleDateClick(dateStr) {
  openDayDetail(dateStr, () => {
    fetchWorkouts();
  });
}

document.addEventListener('DOMContentLoaded', init);
