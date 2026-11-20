import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, ClipboardList, CornerDownLeft, FileText, Search, User, X } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import { tweenFrom, tweenTo, usePresence } from '../lib/animate';
import { cx } from '../utils/cx';

const GROUP_ICONS = { Pages: FileText, Tasks: ClipboardList, People: User, Content: CalendarRange };
const MAX_RESULTS = 8;

const panelIn = (el) => tweenFrom(el, { autoAlpha: 0, y: -4 }, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' });
const panelOut = (el, onComplete) => tweenTo(el, { autoAlpha: 0, y: -4, duration: 0.1, onComplete });

/**
 * Topbar search across pages, tasks and people. Selecting a result navigates
 * to the relevant page (with the search pre-filled where supported).
 * items = [{ id, label, description, to, group }]
 */
export default function GlobalSearch({ items, placeholder = 'Search…' }) {
  const navigate = useNavigate();
  const listId = useId();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items
      .filter((item) => item.label.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
  }, [items, query]);

  useClickOutside(
    [containerRef],
    () => {
      setOpen(false);
      setMobileOpen(false);
    },
    open || mobileOpen,
  );

  // Ctrl/Cmd + K focuses search from anywhere in the portal.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setMobileOpen(true);
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const select = (item) => {
    navigate(item.to);
    setQuery('');
    setOpen(false);
    setMobileOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (event.key === 'Enter') {
      if (results[activeIndex]) {
        event.preventDefault();
        select(results[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
      setMobileOpen(false);
      inputRef.current?.blur();
    }
  };

  const showPanel = open && query.trim().length > 0;
  const [panelMounted, panelRef] = usePresence(showPanel, panelIn, panelOut);
  let lastGroup = null;

  return (
    <div ref={containerRef} className="md:relative">
      <button
        type="button"
        className="icon-btn md:hidden"
        aria-label="Search"
        aria-expanded={mobileOpen}
        onClick={() => {
          setMobileOpen((v) => !v);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
      >
        <Search size={20} aria-hidden="true" />
      </button>

      <div
        className={cx(
          'md:relative md:block',
          mobileOpen ? 'fixed inset-x-0 top-[72px] z-30 block border-b border-line bg-white p-3 shadow-card' : 'hidden',
        )}
      >
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-label="Search"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showPanel && results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className="input h-10 w-full py-2 pr-14 pl-10 md:w-56 lg:w-64 xl:w-72"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink"
              aria-label="Clear search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[10px] font-semibold text-muted lg:block">
              Ctrl K
            </kbd>
          )}
        </div>

        {panelMounted && (
            <div
              ref={panelRef}
              className="absolute inset-x-3 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-pop md:inset-x-auto md:right-0 md:w-[380px]"
            >
              <ul id={listId} role="listbox" aria-label="Search results" className="scroll-thin max-h-[60vh] overflow-y-auto p-1.5">
                {results.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-muted" role="presentation">
                    No matches for “{query.trim()}”.
                  </li>
                )}
                {results.map((item, index) => {
                  const Icon = GROUP_ICONS[item.group] ?? FileText;
                  const showGroup = item.group !== lastGroup;
                  lastGroup = item.group;
                  return (
                    <li key={item.id} role="presentation">
                      {showGroup && (
                        <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted uppercase" aria-hidden="true">
                          {item.group}
                        </p>
                      )}
                      <div
                        id={`${listId}-${index}`}
                        role="option"
                        aria-selected={index === activeIndex}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => select(item)}
                        className={cx(
                          'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5',
                          index === activeIndex ? 'bg-brand-50' : 'hover:bg-canvas',
                        )}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 ring-1 ring-line">
                          <Icon size={15} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">{item.label}</span>
                          {item.description && <span className="block truncate text-xs text-muted">{item.description}</span>}
                        </span>
                        {index === activeIndex && <CornerDownLeft size={14} className="shrink-0 text-brand-700" aria-hidden="true" />}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
        )}
      </div>
    </div>
  );
}
