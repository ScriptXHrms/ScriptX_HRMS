import { LoaderCircle } from 'lucide-react';
import { cx } from '../utils/cx';

const SIZE_MAP = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
};

export default function Spinner({ size = 18, className, label }) {
  const resolvedSize = typeof size === 'number' ? size : SIZE_MAP[size] ?? 18;
  return (
    <>
      <LoaderCircle size={resolvedSize} className={cx('animate-spin', className)} aria-hidden="true" />
      {label && <span className="sr-only">{label}</span>}
    </>
  );
}
