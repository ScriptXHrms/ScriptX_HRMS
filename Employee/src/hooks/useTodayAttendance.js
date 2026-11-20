import { useEffect, useRef, useState } from 'react';
import { useApi } from './useApi';
import { useNow } from './useNow';
import { useToast } from './useToast';
import { api } from '../api/client';
import { formatDuration, formatTime, timeToMinutes } from '../utils/dateUtils';

const STATUS_LABEL = { 'not-started': 'Not Logged In', working: 'Logged In', 'on-break': 'On Break', finished: 'Logged Out' };
const FALLBACK_SHIFT_MINUTES = 540;

const HELPER = {
  'not-started': 'Login to start tracking today’s working hours.',
  working: 'Timer is running. Logout when you finish for the day.',
  'on-break': 'You’re on a break. End it to resume your timer.',
  finished: 'You’re done for today. Attendance resets tomorrow.',
};

function checkInNote(record) {
  if (!record?.login) return undefined;
  if (record.isLate) return `${record.lateMinutes} min late`;
  return record.workType === 'WFH' ? 'Work from home' : 'On time';
}

/** Today's punches and the live timer, shared by the dashboard card and the Attendance page. */
export function useTodayAttendance({ onChange } = {}) {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useApi('/attendance/me/today');
  const [busy, setBusy] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const loadedAt = useRef(Date.now());

  const record = data?.item;
  const shift = data?.shift;
  const state = record?.state ?? 'not-started';
  const running = state === 'working';
  const now = useNow(1000, running);

  useEffect(() => {
    loadedAt.current = Date.now();
  }, [data]);

  const workedMs = (record?.payableMinutes ?? 0) * 60000 + (running ? Math.max(0, now - loadedAt.current) : 0);
  // Overnight shifts (9 PM – 6 AM) wrap past midnight.
  const shiftMinutes = (shift && (timeToMinutes(shift.to) - timeToMinutes(shift.from) + 1440) % 1440) || FALLBACK_SHIFT_MINUTES;

  const mark = async (reason) => {
    setBusy(reason);
    try {
      const { item } = await api.post('/attendance/mark', { reason });
      setData((prev) => ({ ...prev, item }));
      onChange?.();
      if (reason === 'Login') {
        if (item.isLate) toast.warning(`Logged in at ${formatTime(item.login)}`, `That’s ${item.lateMinutes} minutes past the grace period, so today is marked late.`);
        else toast.success(`Logged in at ${formatTime(item.login)}`, 'Have a productive day!');
      } else if (reason === 'Logout') {
        toast.success(`Logged out at ${formatTime(item.logout)}`, `Total working time today: ${formatDuration(item.payableMinutes)}.`);
      } else {
        toast.info(reason === 'Break Out' ? 'Break started' : 'Welcome back', reason === 'Break Out' ? 'Your working timer is paused.' : 'Your working timer has resumed.');
      }
    } catch (failure) {
      toast.error('Couldn’t update attendance', failure.message);
      reload();
    } finally {
      setBusy(null);
      setConfirmOpen(false);
    }
  };

  return {
    record,
    shift,
    graceMinutes: data?.graceMinutes,
    workType: data?.workType,
    state,
    allowed: record?.allowed ?? [],
    loading,
    error,
    reload,
    workedMs,
    shiftMinutes,
    // `changed` marks a shift change HR approved for today.
    shiftNote: shift ? [shift.changed && 'Shift change', `${data?.graceMinutes} min grace`].filter(Boolean).join(' · ') : undefined,
    progress: Math.min(100, (workedMs / (shiftMinutes * 60000)) * 100),
    statusLabel: record?.isLate && running ? 'Late' : STATUS_LABEL[state],
    statusTone: state === 'on-break' ? 'gold' : undefined,
    checkInNote: checkInNote(record),
    helper: HELPER[state],
    busy,
    mark,
    confirmOpen,
    setConfirmOpen,
  };
}
