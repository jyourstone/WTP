import * as state from './state.js';
import { formatDateISO, isToday, isSameMonth } from './utils.js';
import { celebrate } from './celebrate.js';

export function renderDateCell(date, currentYear, currentMonth, onClick) {
  const cell = document.createElement('div');
  cell.className = 'date-cell';
  const dateStr = formatDateISO(date);

  if (!isSameMonth(date, currentYear, currentMonth)) {
    cell.classList.add('date-cell--outside');
  }
  if (isToday(date)) {
    cell.classList.add('date-cell--today');
  }

  const inner = document.createElement('div');
  inner.className = 'date-cell__inner';

  const indicator = document.createElement('div');
  indicator.className = 'date-cell__indicator';
  indicator.dataset.date = dateStr;

  const number = document.createElement('span');
  number.className = 'date-cell__number';
  number.textContent = date.getDate();

  inner.appendChild(indicator);
  inner.appendChild(number);
  cell.appendChild(inner);

  // Apply ring styles
  updateIndicator(indicator, dateStr);

  cell.addEventListener('click', () => onClick(dateStr));

  return cell;
}

export function renderWeekDateCell(date, currentYear, currentMonth, onClick) {
  const cell = renderDateCell(date, currentYear, currentMonth, onClick);
  cell.classList.add('date-cell--week');

  const dateStr = formatDateISO(date);
  const workouts = state.get('workouts')[dateStr] || [];

  if (workouts.length > 0) {
    const workoutsDiv = document.createElement('div');
    workoutsDiv.className = 'date-cell__workouts';
    for (const w of workouts) {
      const label = document.createElement('div');
      label.className = 'date-cell__workout-label';
      if (w.completed) label.classList.add('date-cell__workout-label--completed');
      label.textContent = w.title;
      label.style.backgroundColor = `${w.category_color}25`;
      label.style.color = w.category_color;
      workoutsDiv.appendChild(label);
    }
    cell.appendChild(workoutsDiv);
  }

  return cell;
}

export function updateIndicator(indicator, dateStr) {
  const workouts = state.get('workouts')[dateStr] || [];
  if (workouts.length === 0) {
    indicator.style.boxShadow = 'none';
    indicator.style.backgroundColor = 'transparent';
    return;
  }

  const shadows = [];
  const ringWidth = 3;
  const gap = 2;
  let offset = ringWidth;

  // Process workouts: completed ones get filled, planned get rings
  // If only one workout and completed, use background fill
  if (workouts.length === 1) {
    const w = workouts[0];
    if (w.completed) {
      indicator.style.backgroundColor = w.category_color + '40';
      indicator.style.boxShadow = `inset 0 0 0 ${ringWidth}px ${w.category_color}`;
    } else {
      indicator.style.backgroundColor = 'transparent';
      indicator.style.boxShadow = `0 0 0 ${ringWidth}px ${w.category_color}`;
    }
    return;
  }

  // Multiple workouts: concentric rings
  for (let i = workouts.length - 1; i >= 0; i--) {
    const w = workouts[i];
    if (w.completed) {
      shadows.push(`0 0 0 ${offset}px ${w.category_color}`);
    } else {
      // Ring only: colored border with transparent gap inside
      shadows.push(`0 0 0 ${offset}px ${w.category_color}`);
      if (offset > ringWidth) {
        shadows.push(`0 0 0 ${offset - ringWidth}px var(--bg)`);
      }
    }
    offset += ringWidth + gap;
  }

  indicator.style.backgroundColor = workouts.some(w => w.completed)
    ? workouts.find(w => w.completed).category_color + '30'
    : 'transparent';
  indicator.style.boxShadow = shadows.join(', ');
}

export function triggerCompleteAnimation(dateStr, color) {
  const indicator = document.querySelector(`.date-cell__indicator[data-date="${dateStr}"]`);
  if (!indicator) return;

  if (color) {
    indicator.style.setProperty('--glow-color', color);
  }

  // Get the circle's screen position and launch fireworks from it
  const rect = indicator.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  celebrate(cx, cy);

  // Expand the circle then snap back
  indicator.classList.add('date-cell__indicator--completing');
  setTimeout(() => {
    indicator.classList.remove('date-cell__indicator--completing');
    updateIndicator(indicator, dateStr);
  }, 900);
}
