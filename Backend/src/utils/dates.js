/**
 * Calendar days are stored as "YYYY-MM-DD" strings in the company time zone, so
 * they compare correctly as strings and never shift across time zones.
 */
const TIME_ZONE = 'Asia/Kolkata';

const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false });

export const dayKey = (date = new Date()) => dayFormatter.format(date);

/** Minutes after midnight, company time. */
export function minutesOfDay(date) {
  const [h, m] = timeFormatter.format(date).split(':').map(Number);
  return (h % 24) * 60 + m;
}

export const isDayKey = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

export function timeToMinutes(time) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time ?? '');
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours > 23 || minutes > 59 ? null : hours * 60 + minutes;
}

/** Inclusive list of day keys. */
export function eachDay(startKey, endKey) {
  const days = [];
  const cursor = new Date(`${startKey}T00:00:00Z`);
  const end = new Date(`${endKey}T00:00:00Z`);
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export function shiftDay(key, offset) {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export const isSunday = (key) => new Date(`${key}T00:00:00Z`).getUTCDay() === 0;

export function monthRange(year, month) {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return { start: `${prefix}-01`, end: `${prefix}-${String(last).padStart(2, '0')}`, daysInMonth: last };
}

/** Parses "2026-10" into { year, month }, or null when malformed. */
export function parseMonth(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return month >= 1 && month <= 12 ? { year, month } : null;
}
