import { cx } from '../utils/cx';

/** Pill tabs. tabs = [{ id, label }] */
export default function Tabs({ tabs, active, onChange, label, className }) {
  return (
    <div role="tablist" aria-label={label} className={cx('inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-canvas p-1 ring-1 ring-line', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cx(
            'rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors sm:text-[13px]',
            active === tab.id ? 'bg-white text-brand-700 shadow-sm' : 'text-muted hover:text-brand-700',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
