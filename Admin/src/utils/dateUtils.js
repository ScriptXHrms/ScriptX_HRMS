/**
 * Date helpers. All calendar dates are handled as local "YYYY-MM-DD" strings
 * so they compare correctly as strings and never shift across time zones.
 */
import { useEffect, useState } from 'react';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, '0');

export const STORAGE_KEY = 'scriptx_display_formats';
export const DISPLAY_FORMATS_CHANGED_EVENT = 'scriptx:display-formats-changed';

const getInitialDisplay = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          dateFormat: parsed.dateFormat || 'DD MMM YYYY',
          timeFormat: parsed.timeFormat || '12-Hour',
        };
      }
    } catch {}
  }
  return { dateFormat: 'DD MMM YYYY', timeFormat: '12-Hour' };
};

// Global display config
const display = getInitialDisplay();

// Listen for cross-tab storage changes (Admin <-> Employee)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed.dateFormat) display.dateFormat = parsed.dateFormat;
        if (parsed.timeFormat) display.timeFormat = parsed.timeFormat;
        window.dispatchEvent(new CustomEvent(DISPLAY_FORMATS_CHANGED_EVENT, { detail: { ...display } }));
      } catch {}
    }
  });
}

export function getDisplayFormats() {
  return { ...display };
}

export function setDisplayFormats(formats = {}) {
  if (!formats) return;
  if (formats.dateFormat) {
    display.dateFormat = formats.dateFormat;
  }
  if (formats.timeFormat) {
    display.timeFormat = formats.timeFormat;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        dateFormat: display.dateFormat,
        timeFormat: display.timeFormat,
      }));
    } catch {}
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DISPLAY_FORMATS_CHANGED_EVENT, {
      detail: { dateFormat: display.dateFormat, timeFormat: display.timeFormat }
    }));
  }
}

export function useDisplayFormats() {
  const [formats, setFormats] = useState(() => getDisplayFormats());
  useEffect(() => {
    const handler = (e) => {
      setFormats(e?.detail || getDisplayFormats());
    };
    window.addEventListener(DISPLAY_FORMATS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(DISPLAY_FORMATS_CHANGED_EVENT, handler);
  }, []);
  return formats;
}

export function toISODate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO() {
  return toISODate(new Date());
}

/** Parse "YYYY-MM-DD" into a local Date, or null when invalid. */
export function parseISODate(iso) {
  if (typeof iso !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export function isValidISODate(iso) {
  return parseISODate(iso) !== null;
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function shiftISODate(iso, days) {
  const date = parseISODate(iso);
  return date ? toISODate(addDays(date, days)) : iso;
}

/** Whole days from `fromISO` to `toISO` (positive when `toISO` is later). */
export function diffInDays(fromISO, toISO) {
  const a = parseISODate(fromISO);
  const b = parseISODate(toISO);
  if (!a || !b) return 0;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / DAY_MS);
}

export function daysFromToday(iso) {
  return diffInDays(todayISO(), iso);
}

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value !== 'string') return null;
  const str = value.trim();
  if (!str) return null;

  // 1. "YYYY-MM-DD" or "YYYY/MM/DD"
  const ymdMatch = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(str);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch.map(Number);
    if (!str.includes('T') && !str.includes(' ')) {
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) return date;
    }
  }

  // 2. "DD-MM-YYYY" or "DD/MM/YYYY"
  const dmyMatch = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/.exec(str);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch.map(Number);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) return date;
    }
  }

  // 3. Fallback standard date parse
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Formatted date respecting user settings: DD MMM YYYY, DD/MM/YYYY, MM/DD/YYYY, MM/DD/YY, YYYY/MM/DD */
export function formatDate(value) {
  const date = toDate(value);
  if (!date) return '—';
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  switch (display.dateFormat) {
    case 'DD/MM/YYYY':
      return `${d}/${m}/${y}`;
    case 'MM/DD/YYYY':
      return `${m}/${d}/${y}`;
    case 'MM/DD/YY':
      return `${m}/${d}/${String(y).slice(2)}`;
    case 'YYYY/MM/DD':
      return `${y}/${m}/${d}`;
    case 'DD MMM YYYY':
    default:
      return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${y}`;
  }
}

/** 16 Oct or 16/10 depending on dateFormat */
export function formatShortDate(value) {
  const date = toDate(value);
  if (!date) return '—';
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  switch (display.dateFormat) {
    case 'DD/MM/YYYY':
      return `${d}/${m}`;
    case 'MM/DD/YYYY':
    case 'MM/DD/YY':
      return `${m}/${d}`;
    case 'YYYY/MM/DD':
      return `${m}/${d}`;
    default:
      return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
  }
}

/** Fri, 16 Oct or Fri, 16/10/2026 */
export function formatDayDate(value) {
  const date = toDate(value);
  if (!date) return '—';
  const dayName = WEEKDAYS_SHORT[date.getDay()];
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  switch (display.dateFormat) {
    case 'DD/MM/YYYY':
      return `${dayName}, ${d}/${m}/${y}`;
    case 'MM/DD/YYYY':
      return `${dayName}, ${m}/${d}/${y}`;
    case 'MM/DD/YY':
      return `${dayName}, ${m}/${d}/${String(y).slice(2)}`;
    case 'YYYY/MM/DD':
      return `${dayName}, ${y}/${m}/${d}`;
    default:
      return `${dayName}, ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
  }
}

/** Friday, 16 October 2026 or formatted per display format */
export function formatLongDate(value = new Date()) {
  const date = toDate(value);
  if (!date) return '—';
  const dayName = WEEKDAYS_LONG[date.getDay()];
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  switch (display.dateFormat) {
    case 'DD/MM/YYYY':
      return `${dayName}, ${d}/${m}/${y}`;
    case 'MM/DD/YYYY':
      return `${dayName}, ${m}/${d}/${y}`;
    case 'MM/DD/YY':
      return `${dayName}, ${m}/${d}/${String(y).slice(2)}`;
    case 'YYYY/MM/DD':
      return `${dayName}, ${y}/${m}/${d}`;
    default:
      return `${dayName}, ${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
  }
}

/** Converts "HH:mm" to minutes after midnight, or null. */
export function timeToMinutes(time) {
  if (typeof time !== 'string') return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${pad(h)}:${pad(m)}`;
}

/** Accepts "HH:mm", a Date or an ISO timestamp and returns "9:24 AM" or "09:24". */
export function formatTime(value) {
  let hours;
  let minutes;
  if (typeof value === 'string' && /^(\d{1,2}):(\d{2})/.test(value)) {
    const match = /^(\d{1,2}):(\d{2})/.exec(value);
    hours = Number(match[1]);
    minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return '—';
  } else {
    const date = toDate(value);
    if (!date) return '—';
    hours = date.getHours();
    minutes = date.getMinutes();
  }
  if (display.timeFormat === '24-Hour') return `${pad(hours)}:${pad(minutes)}`;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${pad(minutes)} ${suffix}`;
}

/** 492 -> "8h 12m" */
export function formatDuration(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined || Number.isNaN(totalMinutes)) return '—';
  const safe = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${pad(m)}m`;
}

/** Milliseconds -> "02:14:09" */
export function formatElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Human label for a due date relative to today. */
export function relativeDueLabel(iso) {
  const days = daysFromToday(iso);
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days > 1) return `Due in ${days} days`;
  if (days === -1) return '1 day overdue';
  return `${Math.abs(days)} days overdue`;
}

export function timeAgo(minutesAgo) {
  if (minutesAgo < 1) return 'Just now';
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Counts Monday–Friday days between two ISO dates (inclusive). */
export function countWorkingDays(startISO, endISO) {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  if (!start || !end || end < start) return 0;
  let count = 0;
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    if (!isWeekend(d)) count += 1;
  }
  return count;
}

/** True when two inclusive ISO date ranges overlap. */
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}
