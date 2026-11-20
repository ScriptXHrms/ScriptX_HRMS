import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { monthWeeks, shiftMonth, WEEKDAYS } from './calendarUtils';
import { formatLongDate, todayISO } from '../../utils/dateUtils';
import { monthLabel } from '../../utils/format';
import { cx } from '../../utils/cx';

/** The small month picker on the left of the calendar. */
export default function MiniMonth({ selected, onSelect }) {
  const [shown, setShown] = useState(selected);
  const today = todayISO();
  const month = shown.slice(0, 7);

  useEffect(() => {
    setShown(selected);
  }, [selected]);

  return (
    <section className="card p-5" aria-label="Choose a date">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink">{monthLabel(month)}</h2>
        <div className="flex items-center">
          <button type="button" className="icon-btn h-8 w-8" aria-label="Previous month" onClick={() => setShown((value) => shiftMonth(value, -1))}>
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button type="button" className="icon-btn h-8 w-8" aria-label="Next month" onClick={() => setShown((value) => shiftMonth(value, 1))}>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((name) => (
          <span key={name} className="py-1 text-[11px] font-medium text-muted">
            {name.slice(0, 3)}
          </span>
        ))}
        {monthWeeks(shown)
          .flat()
          .map((day) =>
            day.startsWith(month) ? (
              <button
                key={day}
                type="button"
                onClick={() => onSelect(day)}
                aria-label={formatLongDate(day)}
                aria-pressed={day === selected}
                aria-current={day === today ? 'date' : undefined}
                className={cx(
                  'mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-colors',
                  day === selected ? 'bg-brand-700 text-white' : day === today ? 'bg-gold-100 font-bold text-gold-700' : 'text-ink hover:bg-brand-50 hover:text-brand-700',
                )}
              >
                {Number(day.slice(8))}
              </button>
            ) : (
              <span key={day} aria-hidden="true" />
            ),
          )}
      </div>
    </section>
  );
}
