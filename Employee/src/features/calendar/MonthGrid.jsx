import { useMemo } from 'react';
import EventBar from './EventBar';
import { layoutBars, monthWeeks, WEEKDAYS } from './calendarUtils';
import { formatLongDate, todayISO } from '../../utils/dateUtils';
import { cx } from '../../utils/cx';

const MAX_LANES = 3;

function Week({ days, month, events, onOpen, onPickDay, today }) {
  const bars = useMemo(() => layoutBars(days, events), [days, events]);
  const visible = bars.filter((bar) => bar.lane < MAX_LANES);
  const hidden = bars.filter((bar) => bar.lane >= MAX_LANES);

  return (
    <div className="relative grid min-h-[136px] grid-cols-7 border-t border-line">
      {days.map((day, index) => {
        const more = hidden.filter((bar) => bar.from <= index && index <= bar.to).length;
        return (
          <button
            key={day}
            type="button"
            onClick={() => onPickDay(day)}
            aria-label={`${formatLongDate(day)}, open day view`}
            className={cx('flex flex-col items-start border-l border-line p-1.5 text-left transition-colors first:border-l-0 hover:bg-brand-50/50', !day.startsWith(month) && 'bg-canvas/70')}
          >
            <span className={cx('flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold', day === today ? 'bg-brand-700 text-white' : day.startsWith(month) ? 'text-ink' : 'text-muted/70')}>{Number(day.slice(8))}</span>
            {more > 0 && <span className="mt-auto pl-1 text-[11px] font-semibold text-brand-700">+{more} more</span>}
          </button>
        );
      })}
      <div className="pointer-events-none absolute inset-x-0 top-9 grid grid-cols-7 gap-y-1">
        {visible.map((bar, index) => (
          <EventBar key={bar.event.id} bar={bar} index={index} onOpen={onOpen} className="pointer-events-auto" />
        ))}
      </div>
    </div>
  );
}

/** Month view. Picking a day opens it in the Day view. */
export default function MonthGrid({ anchor, events, onOpen, onPickDay }) {
  const weeks = useMemo(() => monthWeeks(anchor), [anchor]);
  const month = anchor.slice(0, 7);
  const today = todayISO();

  return (
    <div className="scroll-thin overflow-x-auto border-t border-line">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-7 bg-canvas/70">
          {WEEKDAYS.map((name) => (
            <p key={name} className="py-2 text-center text-xs font-semibold tracking-wide text-muted uppercase">
              {name.slice(0, 3)}
            </p>
          ))}
        </div>
        {weeks.map((days) => (
          <Week key={days[0]} days={days} month={month} events={events} onOpen={onOpen} onPickDay={onPickDay} today={today} />
        ))}
      </div>
    </div>
  );
}
