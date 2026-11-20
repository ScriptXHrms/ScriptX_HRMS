import SearchInput from './SearchInput';

/**
 * Toolbar above a table.
 * filters = [{ key, label, type: 'select' | 'date' | 'month', options, allLabel }]
 */
export default function FilterBar({ idPrefix, search, onSearch, searchPlaceholder, filters = [], values, onChange, children }) {
  const hasControls = onSearch || filters.length > 0 || children;
  if (!hasControls) return null;
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:px-6">
      {onSearch && <SearchInput id={`${idPrefix}-search`} value={search} onChange={onSearch} placeholder={searchPlaceholder} className="sm:max-w-xs sm:flex-1" />}
      {filters.map((filter) => {
        const id = `${idPrefix}-${filter.key}`;
        const value = values[filter.key] ?? '';
        return (
          <div key={filter.key} className="sm:min-w-[160px]">
            <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted">
              {filter.label}
            </label>
            {filter.type === 'select' ? (
              <select id={id} value={value} onChange={(e) => onChange(filter.key, e.target.value)} className="input select">
                <option value="">{filter.allLabel ?? 'All'}</option>
                {(filter.options ?? []).map((option) => {
                  const item = typeof option === 'object' ? option : { value: option, label: option };
                  return (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  );
                })}
              </select>
            ) : (
              <input id={id} type={filter.type} value={value} onChange={(e) => onChange(filter.key, e.target.value)} className="input" />
            )}
          </div>
        );
      })}
      {children && <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{children}</div>}
    </div>
  );
}
