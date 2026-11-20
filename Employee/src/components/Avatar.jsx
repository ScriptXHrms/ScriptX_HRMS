import { useState } from 'react';
import { fileUrl } from '../api/client';
import { cx } from '../utils/cx';

const PALETTE = [
  'bg-brand-100 text-brand-800',
  'bg-gold-100 text-gold-700',
  'bg-sky-100 text-sky-800',
  'bg-green-100 text-green-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
  'bg-teal-100 text-teal-800',
  'bg-indigo-100 text-indigo-800',
];

const SIZES = {
  xs: 'h-7 w-7 text-[11px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

/**
 * The person's photo when they have one (an /uploads path), otherwise initials in a stable colour.
 * A photo that fails to load falls back to the initials.
 */
export default function Avatar({ name, photo, size = 'md', className }) {
  const [broken, setBroken] = useState(null);
  if (photo && broken !== photo) {
    return (
      <img
        src={fileUrl(photo)}
        alt=""
        onError={() => setBroken(photo)}
        className={cx('shrink-0 rounded-full bg-canvas object-cover', SIZES[size] ?? SIZES.md, className)}
        aria-hidden="true"
      />
    );
  }
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold select-none',
        SIZES[size] ?? SIZES.md,
        colorFor(name ?? ''),
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}

/** Avatar + name + optional subtitle, used in tables and lists. */
export function PersonCell({ name, subtitle, size = 'sm' }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={name} size={size} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
