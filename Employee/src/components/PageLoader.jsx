import Spinner from './Spinner';
import { cx } from '../utils/cx';

export default function PageLoader({ fullScreen = false, label = 'Loading…' }) {
  return (
    <div
      className={cx('flex items-center justify-center gap-3 text-sm font-medium text-muted', fullScreen ? 'min-h-dvh' : 'min-h-[50vh]')}
      role="status"
    >
      <Spinner size={22} className="text-brand-700" />
      {label}
    </div>
  );
}
