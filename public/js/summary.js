import * as api from './api.js';
import * as state from './state.js';
import { getDateRange } from './calendar.js';

let contentEl;
let toggleEl;
let summaryEl;

export function init() {
  summaryEl = document.getElementById('summary');
  contentEl = document.getElementById('summary-content');
  toggleEl = document.getElementById('summary-toggle');

  toggleEl.addEventListener('click', () => {
    summaryEl.classList.toggle('summary--open');
    if (summaryEl.classList.contains('summary--open')) {
      refresh();
    }
  });

  state.subscribe('workouts', () => {
    if (summaryEl.classList.contains('summary--open')) {
      refresh();
    }
  });

  state.subscribe('currentDate', () => {
    if (summaryEl.classList.contains('summary--open')) {
      refresh();
    }
  });

  state.subscribe('viewMode', () => {
    if (summaryEl.classList.contains('summary--open')) {
      refresh();
    }
  });
}

export async function refresh() {
  const { from, to } = getDateRange();
  try {
    const data = await api.getSummary(from, to);
    render(data);
  } catch {
    contentEl.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">Kunde inte ladda sammanfattning.</p>';
  }
}

function render({ summary, totals }) {
  contentEl.innerHTML = '';

  if (summary.length === 0) {
    contentEl.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">Inga pass under denna period.</p>';
    return;
  }

  for (const s of summary) {
    const row = document.createElement('div');
    row.className = 'summary__row';

    const pct = totals.total > 0 ? (s.completed / totals.total) * 100 : 0;

    row.innerHTML = `
      <span class="summary__dot" style="background:${s.color}"></span>
      <span class="summary__name">${escapeHtml(s.name)}</span>
      <span class="summary__count">${s.completed}/${s.total}</span>
      <div class="summary__bar">
        <div class="summary__bar-fill" style="width:${s.total > 0 ? (s.completed / s.total) * 100 : 0}%;background:${s.color}"></div>
      </div>
    `;

    contentEl.appendChild(row);
  }

  // Total row
  const totalRow = document.createElement('div');
  totalRow.className = 'summary__total';
  totalRow.innerHTML = `
    <span>Totalt</span>
    <span>${totals.completed}/${totals.total} pass</span>
  `;
  contentEl.appendChild(totalRow);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
