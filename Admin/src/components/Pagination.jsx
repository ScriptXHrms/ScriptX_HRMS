import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../utils/cx';

function pageList(page, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push(`gap-${p}`);
    result.push(p);
  });
  return result;
}

export default function Pagination({ page, pageCount, onPageChange, totalItems, pageSize, itemLabel = 'items' }) {
  if (totalItems === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row sm:px-6"
    >
      <p className="text-sm text-muted">
        Showing <span className="font-semibold text-ink">{from}–{to}</span> of{' '}
        <span className="font-semibold text-ink">{totalItems}</span> {itemLabel}
      </p>
      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="icon-btn h-9 w-9 disabled:opacity-40"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          {pageList(page, pageCount).map((p) =>
            typeof p === 'string' ? (
              <span key={p} className="px-1 text-sm text-muted" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                className={cx(
                  'h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition-colors',
                  p === page ? 'bg-brand-700 text-white' : 'text-muted hover:bg-brand-50 hover:text-brand-700',
                )}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            className="icon-btn h-9 w-9 disabled:opacity-40"
            onClick={() => onPageChange(page + 1)}
            disabled={page === pageCount}
            aria-label="Next page"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </nav>
  );
}
