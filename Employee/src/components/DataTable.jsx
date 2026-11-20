import { useEffect, useMemo, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import { cx } from '../utils/cx';

const DEFAULT_PAGE_SIZE = 10;

function SkeletonRows({ columns, rows = 6 }) {
  return Array.from({ length: rows }, (_, row) => (
    <tr key={row}>
      {columns.map((column) => (
        <td key={column.key} className="td">
          <div className="skeleton h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  ));
}

/**
 * Standard table: loading skeleton, error + retry, empty state and client-side
 * paging. columns = [{ key, header, render(row, index), align, className }]
 * Pass `selection` = { selected: Set, onChange(Set) } for row checkboxes.
 * `fitWidth` lets a table with few columns shrink to a phone instead of scrolling.
 */
export default function DataTable({
  columns,
  rows,
  rowKey = (row) => row._id,
  loading = false,
  error,
  onRetry,
  empty = {},
  itemLabel = 'records',
  pageSize = DEFAULT_PAGE_SIZE,
  caption,
  selection,
  className,
  fitWidth = false,
}) {
  const [page, setPage] = useState(1);
  const list = useMemo(() => rows ?? [], [rows]);
  const pageCount = Math.max(1, Math.ceil(list.length / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const firstIndex = (page - 1) * pageSize;
  const visible = list.slice(firstIndex, firstIndex + pageSize);
  const showSkeleton = loading && !rows;

  if (error && !rows) {
    return (
      <EmptyState
        icon={TriangleAlert}
        title="Couldn’t load this data"
        description={error.message}
        action={
          onRetry && (
            <button type="button" className="btn btn-secondary" onClick={onRetry}>
              Try again
            </button>
          )
        }
      />
    );
  }

  const allVisibleSelected = selection && visible.length > 0 && visible.every((row) => selection.selected.has(rowKey(row)));
  const togglePage = () => {
    const next = new Set(selection.selected);
    visible.forEach((row) => (allVisibleSelected ? next.delete(rowKey(row)) : next.add(rowKey(row))));
    selection.onChange(next);
  };
  const toggleRow = (id) => {
    const next = new Set(selection.selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selection.onChange(next);
  };

  return (
    <div className={className}>
      <div className="scroll-thin overflow-x-auto">
        <table className={cx('w-full border-collapse text-left', !fitWidth && 'min-w-[640px]')}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="border-y border-line bg-canvas/70">
            <tr>
              {selection && (
                <th scope="col" className="th w-10">
                  <input type="checkbox" aria-label="Select all on this page" checked={allVisibleSelected} onChange={togglePage} className="h-4 w-4 accent-brand-700" />
                </th>
              )}
              {columns.map((column) => (
                <th key={column.key} scope="col" className={cx('th', column.align === 'right' && 'text-right', column.align === 'center' && 'text-center')}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {showSkeleton && <SkeletonRows columns={selection ? [{ key: 'select' }, ...columns] : columns} />}
            {!showSkeleton &&
              visible.map((row, index) => {
                const id = rowKey(row);
                return (
                  <tr key={id} className="transition-colors hover:bg-brand-50/30">
                    {selection && (
                      <td className="td">
                        <input type="checkbox" aria-label="Select row" checked={selection.selected.has(id)} onChange={() => toggleRow(id)} className="h-4 w-4 accent-brand-700" />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className={cx('td', column.align === 'right' && 'text-right', column.align === 'center' && 'text-center', column.className)}>
                        {column.render ? column.render(row, firstIndex + index) : (row[column.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {!showSkeleton && list.length === 0 && (
        <EmptyState icon={empty.icon} title={empty.title ?? `No ${itemLabel} found`} description={empty.description ?? 'Try changing your filters.'} action={empty.action} />
      )}
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} totalItems={list.length} pageSize={pageSize} itemLabel={itemLabel} />
    </div>
  );
}
