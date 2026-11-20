import { Flag } from 'lucide-react';
import { cx } from '../utils/cx';

const TONES = {
  neutral: { badge: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
  brand: { badge: 'bg-brand-50 text-brand-700 ring-brand-200', dot: 'bg-brand-600' },
  gold: { badge: 'bg-gold-50 text-gold-700 ring-gold-200', dot: 'bg-gold-500' },
  orange: { badge: 'bg-orange-50 text-orange-700 ring-orange-200', dot: 'bg-orange-500' },
  green: { badge: 'bg-green-50 text-green-700 ring-green-200', dot: 'bg-green-600' },
  red: { badge: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-600' },
  sky: { badge: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
};

/** Tone per value across tasks, priorities, attendance, leave and records. */
const VALUE_TONES = {
  // Task status
  'To Do': 'neutral',
  'In Progress': 'brand',
  'In Review': 'gold',
  Done: 'green',
  Completed: 'green',
  Blocked: 'red',
  Overdue: 'red',
  // Priority
  Low: 'neutral',
  Medium: 'sky',
  High: 'orange',
  Urgent: 'red',
  // Attendance
  Present: 'green',
  'Work From Home': 'brand',
  'On Leave': 'gold',
  Absent: 'red',
  Late: 'orange',
  'Not Checked In': 'neutral',
  'Checked In': 'green',
  'Checked Out': 'brand',
  'Not Logged In': 'neutral',
  'Logged In': 'green',
  'Logged Out': 'brand',
  // Leave
  Pending: 'gold',
  Approved: 'green',
  Rejected: 'red',
  Cancelled: 'neutral',
  // Tester
  'Not Tested': 'neutral',
  Testing: 'sky',
  Passed: 'green',
  Failed: 'red',
  // Records
  Active: 'green',
  Inactive: 'neutral',
  Paid: 'green',
  Unpaid: 'red',
  Partial: 'gold',
  Relieving: 'gold',
  Relieved: 'neutral',
  Credit: 'green',
  Debit: 'red',
  'On Hold': 'orange',
  // Attendance days
  'Half Day': 'orange',
  'On Duty': 'sky',
  Holiday: 'sky',
  'Weekly Off': 'neutral',
  Upcoming: 'neutral',
  'Not Joined': 'neutral',
};

/**
 * Text + colour badge (never colour alone).
 * kind="priority" renders a squared badge with a flag icon so priorities
 * read differently from statuses in the same row.
 */
export default function StatusBadge({ value, label, kind = 'status', tone, size = 'sm', className }) {
  const styles = TONES[tone ?? VALUE_TONES[value] ?? 'neutral'];
  const isPriority = kind === 'priority';
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 font-semibold whitespace-nowrap ring-1 ring-inset',
        isPriority ? 'rounded-md' : 'rounded-full',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        styles.badge,
        className,
      )}
    >
      {isPriority ? (
        <Flag size={12} strokeWidth={2.5} aria-hidden="true" />
      ) : (
        <span className={cx('h-1.5 w-1.5 shrink-0 rounded-full', styles.dot)} aria-hidden="true" />
      )}
      {isPriority && <span className="sr-only">Priority:</span>}
      {label ?? value}
    </span>
  );
}
