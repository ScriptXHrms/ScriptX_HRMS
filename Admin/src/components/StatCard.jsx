import { ArrowUpRight, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useRiseIn } from '../lib/animate';
import { cx } from '../utils/cx';

const TONES = {
  brand: 'bg-brand-50 text-brand-700',
  gold: 'bg-gold-100 text-gold-700',
  green: 'bg-green-50 text-green-700',
  orange: 'bg-orange-50 text-orange-700',
  red: 'bg-red-50 text-red-700',
  sky: 'bg-sky-50 text-sky-700',
  neutral: 'bg-slate-100 text-slate-700',
};

/**
 * KPI tile.
 * trend = { value: '+3', label: 'this quarter', positive: true | false | null, direction?: 'up'|'down'|'flat' }
 */
export default function StatCard({ icon: Icon, title, value, suffix, trend, hint, tone = 'brand', onClick, active, index = 0 }) {
  const Component = onClick ? 'button' : 'div';
  const ref = useRiseIn(index);
  const direction = trend?.direction ?? (trend?.positive === false ? 'down' : trend?.positive ? 'up' : 'flat');
  const TrendIcon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;

  return (
    <Component
      ref={ref}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-pressed={onClick && active !== undefined ? active : undefined}
      className={cx(
        'card group relative flex w-full min-w-0 flex-col overflow-hidden p-4 text-left sm:p-5',
        'before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gold-400 before:opacity-0 before:transition-opacity',
        onClick && 'transition-[box-shadow,border-color] hover:border-brand-200 hover:shadow-pop hover:before:opacity-100',
        active && 'border-brand-600 ring-2 ring-brand-100 before:opacity-100',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 pt-1 text-[13px] leading-snug font-medium text-muted sm:text-sm">{title}</p>
        <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10', TONES[tone] ?? TONES.brand)}>
          <Icon size={19} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-ink tabular-nums sm:text-3xl">
        {value}
        {suffix && <span className="ml-1 text-sm font-semibold text-muted">{suffix}</span>}
      </p>
      {(trend || hint) && (
        <div className="mt-2 flex min-w-0 items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={cx(
                'inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold',
                trend.positive === true && 'bg-green-50 text-green-700',
                trend.positive === false && 'bg-red-50 text-red-700',
                (trend.positive === null || trend.positive === undefined) && 'bg-slate-100 text-slate-700',
              )}
            >
              <TrendIcon size={12} aria-hidden="true" />
              {trend.value}
            </span>
          )}
          <span className="truncate text-muted">{trend?.label ?? hint}</span>
        </div>
      )}
      {onClick && (
        <ArrowUpRight
          size={16}
          className="absolute right-4 bottom-4 text-brand-700 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        />
      )}
    </Component>
  );
}
