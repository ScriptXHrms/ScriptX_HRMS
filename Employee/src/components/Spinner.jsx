import { LoaderCircle } from 'lucide-react';
import { cx } from '../utils/cx';

export default function Spinner({ size = 18, className, label }) {
  return (
    <>
      <LoaderCircle size={size} className={cx('animate-spin', className)} aria-hidden="true" />
      {label && <span className="sr-only">{label}</span>}
    </>
  );
}
