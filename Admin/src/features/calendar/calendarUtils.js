import { TASK_CATEGORIES } from '../../data/constants';
import { addDays, formatTime, parseISODate, shiftISODate, timeToMinutes, toISODate } from '../../utils/dateUtils';

export const OTHER_CATEGORY = 'Other';
export const CATEGORIES = [...TASK_CATEGORIES, OTHER_CATEGORY];

/** Pastel card, coloured time text and dot for each task category. */
export const CATEGORY_STYLES = {
  SEO: { card: 'border-green-200 bg-green-50', time: 'text-green-700', dot: 'bg-green-600' },
  'Social Media': { card: 'border-sky-200 bg-sky-50', time: 'text-sky-700', dot: 'bg-sky-600' },
  'Content Writing': { card: 'border-brand-200 bg-brand-50', time: 'text-brand-700', dot: 'bg-brand-600' },
  'Graphic Design': { card: 'border-pink-200 bg-pink-50', time: 'text-pink-700', dot: 'bg-pink-600' },
  'Video Editing': { card: 'border-red-200 bg-red-50', time: 'text-red-700', dot: 'bg-red-600' },
  'Paid Ads': { card: 'border-gold-200 bg-gold-50', time: 'text-gold-700', dot: 'bg-gold-500' },
  'Email Marketing': { card: 'border-teal-200 bg-teal-50', time: 'text-teal-700', dot: 'bg-teal-600' },
  [OTHER_CATEGORY]: { card: 'border-slate-200 bg-slate-100', time: 'text-slate-700', dot: 'bg-slate-500' },
};

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const HOUR_HEIGHT = 76;

const DAY_MINUTES = 24 * 60;
const DEFAULT_MINUTES = 60;

export function startOfWeek(iso) {
  const date = parseISODate(iso);
  return toISODate(addDays(date, -date.getDay()));
}

export const weekDays = (iso) => Array.from({ length: 7 }, (_, index) => shiftISODate(startOfWeek(iso), index));

/** The Sunday-first weeks that touch the month containing `iso`. */
export function monthWeeks(iso) {
  const month = iso.slice(0, 7);
  const weeks = Array.from({ length: 6 }, (_, index) => weekDays(shiftISODate(`${month}-01`, index * 7)));
  return weeks.filter((days) => days.some((day) => day.startsWith(month)));
}

export function shiftMonth(iso, delta) {
  const date = parseISODate(iso);
  const target = new Date(date.getFullYear(), date.getMonth() + delta, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return toISODate(target);
}

/**
 * A task as a calendar event, or null when it has no dates. Only a single-day
 * task with a start time sits in the hourly grid; everything else is a bar.
 */
export function toEvent(task) {
  const start = task.startDate || task.dueDate;
  if (!start) return null;
  const end = task.dueDate && task.dueDate > start ? task.dueDate : start;
  const startMinutes = timeToMinutes(task.startTime);
  const endMinutes = timeToMinutes(task.endTime);
  const timed = start === end && startMinutes !== null;
  return {
    id: task._id,
    task,
    start,
    end,
    timed,
    startMinutes,
    endMinutes: endMinutes > startMinutes ? endMinutes : Math.min(startMinutes + DEFAULT_MINUTES, DAY_MINUTES),
    category: CATEGORIES.includes(task.category) ? task.category : OTHER_CATEGORY,
  };
}

export function timeLabel({ task }) {
  if (!task.startTime) return '';
  const start = formatTime(task.startTime);
  if (!task.endTime) return start;
  const end = formatTime(task.endTime);
  // "9:00 – 10:30 AM": a repeated AM or PM only takes up room in narrow columns.
  const sameHalf = /[AP]M$/.test(start) && start.slice(-2) === end.slice(-2);
  return `${sameHalf ? start.slice(0, -3) : start} – ${end}`;
}

/** Places overlapping timed events side by side: adds `lane` and `lanes`. */
export function layoutTimed(events) {
  const sorted = [...events].sort((a, b) => a.startMinutes - b.startMinutes || b.endMinutes - a.endMinutes);
  const placed = [];
  let cluster = [];
  let clusterEnd = -1;

  const flush = () => {
    const laneEnds = [];
    const lanes = cluster.map((event) => {
      let lane = laneEnds.findIndex((end) => end <= event.startMinutes);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = event.endMinutes;
      return lane;
    });
    cluster.forEach((event, index) => placed.push({ ...event, lane: lanes[index], lanes: laneEnds.length }));
    cluster = [];
    clusterEnd = -1;
  };

  sorted.forEach((event) => {
    if (cluster.length > 0 && event.startMinutes >= clusterEnd) flush();
    cluster.push(event);
    clusterEnd = Math.max(clusterEnd, event.endMinutes);
  });
  flush();
  return placed;
}

/** Fits events across a row of days: each bar gets `from`, `span` and a `lane`. */
export function layoutBars(days, events) {
  const first = days[0];
  const last = days[days.length - 1];
  const laneEnds = [];

  return events
    .filter((event) => event.start <= last && event.end >= first)
    .sort((a, b) => a.start.localeCompare(b.start) || b.end.localeCompare(a.end))
    .map((event) => {
      const from = days.indexOf(event.start < first ? first : event.start);
      const to = days.indexOf(event.end > last ? last : event.end);
      let lane = laneEnds.findIndex((end) => end < from);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = to;
      return { event, from, to, span: to - from + 1, lane };
    });
}
