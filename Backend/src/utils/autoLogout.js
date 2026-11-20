import { Attendance } from '../models/index.js';
import { dayKey } from './dates.js';

const EVERY_MS = 60 * 1000;

/** Closes attendance left open on an earlier day with a Logout at 11:59 PM that day, marked as automatic. */
export async function closeOpenDays() {
  const open = await Attendance.find({ date: { $lt: dayKey() }, 'entries.0': { $exists: true }, 'entries.reason': { $ne: 'Logout' } });
  for (const record of open) {
    record.entries.push({ reason: 'Logout', time: new Date(`${record.date}T23:59:59+05:30`) });
    record.autoLogout = true;
    await record.save();
  }
  return open.length;
}

/** Runs once at startup, to catch up after downtime, then every minute so a day closes just after midnight. */
export function startAutoLogout() {
  const run = () =>
    closeOpenDays()
      .then((count) => count && console.log(`Auto logout: closed ${count} open attendance day(s).`))
      .catch((error) => console.error('Auto logout failed:', error.message));
  run();
  setInterval(run, EVERY_MS).unref();
}
