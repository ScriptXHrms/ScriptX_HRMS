import { cx } from '../utils/cx';

/** White card with an optional title row — the standard dashboard panel. */
export default function SectionCard({ title, description, action, children, className, bodyClassName, flush = false }) {
  return (
    <section className={cx('card flex min-w-0 flex-col', className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="min-w-0">
            {title && <h2 className="text-base font-bold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cx('flex-1', flush ? 'pt-4' : 'p-5 sm:p-6', !flush && title && 'pt-4', bodyClassName)}>{children}</div>
    </section>
  );
}
