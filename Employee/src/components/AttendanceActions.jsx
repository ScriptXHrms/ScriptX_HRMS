import { Coffee, LogIn, LogOut } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import Spinner from './Spinner';
import { formatDuration } from '../utils/dateUtils';
import { cx } from '../utils/cx';

/** Login, Break and Logout, with the logout confirmation. */
export default function AttendanceActions({ attendance, className }) {
  const { allowed, busy, mark, state, confirmOpen, setConfirmOpen, workedMs } = attendance;
  const onBreak = state === 'on-break';

  return (
    <>
      <div className={cx('grid gap-2 sm:grid-cols-3', className)}>
        <button type="button" className="btn btn-primary px-2" onClick={() => mark('Login')} disabled={!allowed.includes('Login') || busy !== null}>
          {busy === 'Login' ? <Spinner size={16} /> : <LogIn size={16} aria-hidden="true" />}
          Login
        </button>
        <button
          type="button"
          className="btn btn-secondary px-2"
          onClick={() => mark(onBreak ? 'Break In' : 'Break Out')}
          disabled={!(allowed.includes('Break Out') || allowed.includes('Break In')) || busy !== null}
        >
          {busy === 'Break In' || busy === 'Break Out' ? <Spinner size={16} /> : <Coffee size={16} aria-hidden="true" />}
          {onBreak ? 'End Break' : 'Break'}
        </button>
        <button type="button" className="btn btn-secondary px-2" onClick={() => setConfirmOpen(true)} disabled={!allowed.includes('Logout') || busy !== null}>
          <LogOut size={16} aria-hidden="true" />
          Logout
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        tone="primary"
        title="Logout for today?"
        message={
          <>
            You’ve logged <strong className="text-ink">{formatDuration(Math.round(workedMs / 60000))}</strong> today. After logging out you can’t log in again today.
          </>
        }
        confirmLabel="Logout"
        loading={busy === 'Logout'}
        onConfirm={() => mark('Logout')}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
