const MONTH_NAMES = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
];

const DAY_NAMES_SHORT = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
const DAY_NAMES = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

export function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(isoStr) {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatSwedishDate(date) {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()].toLowerCase()} ${date.getFullYear()}`;
}

export function formatMonthYear(date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatWeekRange(monday) {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const weekNum = getWeekNumber(monday);
  if (monday.getMonth() === sunday.getMonth()) {
    return `Vecka ${weekNum}, ${monday.getDate()}–${sunday.getDate()} ${MONTH_NAMES[monday.getMonth()].toLowerCase()}`;
  }
  return `Vecka ${weekNum}, ${monday.getDate()} ${MONTH_NAMES[monday.getMonth()].toLowerCase().slice(0, 3)}–${sunday.getDate()} ${MONTH_NAMES[sunday.getMonth()].toLowerCase().slice(0, 3)}`;
}

export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getMonthGridDates(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startMonday = getMonday(firstDay);
  const dates = [];
  const current = new Date(startMonday);
  // Always generate 6 weeks (42 days) for consistent grid
  for (let i = 0; i < 42; i++) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function getWeekDates(monday) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function isToday(date) {
  const now = new Date();
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function isSameMonth(date, year, month) {
  return date.getFullYear() === year && date.getMonth() === month;
}

export { MONTH_NAMES, DAY_NAMES_SHORT, DAY_NAMES };
