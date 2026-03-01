import * as state from './state.js';
import { renderDateCell, renderWeekDateCell, updateIndicator } from './dateCell.js';
import {
  getMonthGridDates, getWeekDates, getMonday,
  formatMonthYear, formatWeekRange, formatDateISO,
  DAY_NAMES_SHORT
} from './utils.js';

let container;
let onDateClick;

export function init(calendarEl, dateClickHandler) {
  container = calendarEl;
  onDateClick = dateClickHandler;
  state.subscribe('workouts', () => render());
  state.subscribe('viewMode', () => render());
  state.subscribe('currentDate', () => render());
}

export function render() {
  if (!container) return;
  const viewMode = state.get('viewMode');
  const currentDate = state.get('currentDate');

  container.innerHTML = '';
  container.className = `calendar ${viewMode === 'week' ? 'calendar--week' : ''}`;

  // Day headers
  const headers = document.createElement('div');
  headers.className = 'calendar__day-headers';
  for (const day of DAY_NAMES_SHORT) {
    const h = document.createElement('div');
    h.className = 'calendar__day-header';
    h.textContent = day;
    headers.appendChild(h);
  }
  container.appendChild(headers);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'calendar__grid';

  if (viewMode === 'month') {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dates = getMonthGridDates(year, month);
    for (const date of dates) {
      grid.appendChild(renderDateCell(date, year, month, onDateClick));
    }
  } else {
    const monday = getMonday(currentDate);
    const dates = getWeekDates(monday);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    for (const date of dates) {
      grid.appendChild(renderWeekDateCell(date, year, month, onDateClick));
    }
  }

  container.appendChild(grid);
}

export function getTitle() {
  const viewMode = state.get('viewMode');
  const currentDate = state.get('currentDate');
  if (viewMode === 'month') {
    return formatMonthYear(currentDate);
  }
  return formatWeekRange(getMonday(currentDate));
}

export function getDateRange() {
  const viewMode = state.get('viewMode');
  const currentDate = state.get('currentDate');

  if (viewMode === 'month') {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dates = getMonthGridDates(year, month);
    return {
      from: formatDateISO(dates[0]),
      to: formatDateISO(dates[dates.length - 1]),
    };
  }

  const monday = getMonday(currentDate);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return {
    from: formatDateISO(monday),
    to: formatDateISO(sunday),
  };
}

export function navigatePrev() {
  const currentDate = state.get('currentDate');
  const viewMode = state.get('viewMode');
  const d = new Date(currentDate);
  if (viewMode === 'month') {
    d.setMonth(d.getMonth() - 1);
  } else {
    d.setDate(d.getDate() - 7);
  }
  state.set('currentDate', d);
}

export function navigateNext() {
  const currentDate = state.get('currentDate');
  const viewMode = state.get('viewMode');
  const d = new Date(currentDate);
  if (viewMode === 'month') {
    d.setMonth(d.getMonth() + 1);
  } else {
    d.setDate(d.getDate() + 7);
  }
  state.set('currentDate', d);
}

export function goToday() {
  state.set('currentDate', new Date());
}
