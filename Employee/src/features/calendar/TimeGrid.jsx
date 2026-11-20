import { useLayoutEffect, useMemo, useRef } from 'react';
import EventBar from './EventBar';
import { CATEGORY_STYLES, HOUR_HEIGHT, layoutBars, layoutTimed, timeLabel, WEEKDAYS } from './calendarUtils';
import Avatar from '../../components/Avatar';
import { useNow } from '../../hooks/useNow';
import { useRiseIn } from '../../lib/animate';
import { formatTime, minutesToTime, parseISODate, todayISO } from '../../utils/dateUtils';
import { cx } from '../../utils/cx';

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const FIRST_VISIBLE_HOUR = 8;
const MINUTE_REFRESH_MS = 60000;
const GUTTER = '72px';
const MIN_CARD_HEIGHT = 46;
const LABEL_CLEARANCE = 14;

function TimedEvent({ event, index, onOpen }) {
  const ref = useRiseIn(index);
  const styles = CATEGORY_STYLES[event.category];
  const height = Math.max(((event.endMinutes - event.startMinutes) / 60) * HOUR_HEIGHT - 4, MIN_CARD_HEIGHT);

  return (
    <button
      ref={ref}
      type="button"
      title={event.task.title}
      onClick={() => onOpen(event)}
      style={{
        top: (event.startMinutes / 60) * HOUR_HEIGHT + 2,
        height,
        left: `calc(${(event.lane * 100) / event.lanes}% + 3px)`,
        width: `calc(${100 / event.lanes}% - 6px)`,
      }}
      className={cx('absolute z-10 overflow-hidden rounded-xl border px-2.5 py-1.5 text-left transition-shadow hover:z-20 hover:shadow-pop', styles.card)}
    >
      <span className={cx('block truncate text-[11px] font-semibold', styles.time)}>{timeLabel(event)}</span>
      <span className="line-clamp-2 text-[13px] leading-snug font-semibold text-ink">{event.task.title}</span>
      {height > 76 && (
        <span className="mt-1.5 flex -space-x-1.5">
          {(event.task.assignedTo ?? []).slice(0, 3).map((person) => (
            <Avatar key={person._id} name={person.name} size="xs" className="ring-2 ring-white" />
          ))}
        </span>
      )}
    </button>
  );
}

/** Hourly Day and Week views, with an all-day lane for tasks without a time. */
export default function TimeGrid({ days, events, onOpen }) {
  const scrollRef = useRef(null);
  const now = useNow(MINUTE_REFRESH_MS);
  const today = todayISO();
  const columns = `${GUTTER} repeat(${days.length}, minmax(0, 1fr))`;

  const bars = useMemo(() => layoutBars(days, events.filter((event) => !event.timed)), [days, events]);
  const timedByDay = useMemo(() => days.map((day) => layoutTimed(events.filter((event) => event.timed && event.start === day))), [days, events]);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = FIRST_VISIBLE_HOUR * HOUR_HEIGHT - LABEL_CLEARANCE;
  }, []);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNow = days.includes(today);

  return (
    <div ref={scrollRef} className="scroll-thin max-h-[720px] overflow-auto border-t border-line">
      <div className={cx(days.length > 1 && 'min-w-[760px]')}>
        <div className="sticky top-0 z-30 border-b border-line bg-white">
          <div className="grid" style={{ gridTemplateColumns: columns }}>
            <span aria-hidden="true" />
            {days.map((day) => {
              const isToday = day === today;
              return (
                <div key={day} className="border-l border-line px-1 py-2.5 text-center">
                  <p className={cx('text-sm font-bold', isToday ? 'text-brand-700' : 'text-ink')}>{WEEKDAYS[parseISODate(day).getDay()]}</p>
                  <p className={cx('mx-auto mt-0.5 flex h-6 min-w-6 w-fit items-center justify-center rounded-full px-1 text-xs font-semibold', isToday ? 'bg-brand-700 text-white' : 'text-muted')}>{Number(day.slice(8))}</p>
                </div>
              );
            })}
          </div>
          {bars.length > 0 && (
            <div className="grid border-t border-line" style={{ gridTemplateColumns: `${GUTTER} minmax(0, 1fr)` }}>
              <span className="py-1.5 pr-2 text-right text-[11px] font-medium text-muted">All day</span>
              <div className="scroll-thin max-h-[116px] overflow-y-auto py-1">
                <div className="grid gap-y-1" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
                  {bars.map((bar, index) => (
                    <EventBar key={bar.event.id} bar={bar} index={index} onOpen={onOpen} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative grid" style={{ gridTemplateColumns: columns, height: HOUR_HEIGHT * HOURS.length }}>
          <div className="relative">
            {HOURS.slice(1).map((hour) => (
              <span key={hour} className="absolute right-2 -translate-y-1/2 text-[11px] font-medium text-muted" style={{ top: hour * HOUR_HEIGHT }}>
                {formatTime(minutesToTime(hour * 60))}
              </span>
            ))}
          </div>

          {days.map((day, dayIndex) => (
            <div key={day} className="relative border-l border-line">
              {HOURS.slice(1).map((hour) => (
                <span key={hour} className="absolute inset-x-0 border-t border-line/70" style={{ top: hour * HOUR_HEIGHT }} aria-hidden="true" />
              ))}
              {timedByDay[dayIndex].map((event, index) => (
                <TimedEvent key={event.id} event={event} index={index} onOpen={onOpen} />
              ))}
            </div>
          ))}

          {showNow && (
            <div className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: (nowMinutes / 60) * HOUR_HEIGHT }} aria-hidden="true">
              <span className="w-[72px] shrink-0 pl-1">
                <span className="block rounded-full bg-brand-700 py-0.5 text-center text-[10px] font-bold text-white">{formatTime(minutesToTime(nowMinutes))}</span>
              </span>
              <span className="h-2 w-2 shrink-0 -translate-x-1 rounded-full bg-gold-400 ring-2 ring-white" />
              <span className="h-px flex-1 -translate-x-1 bg-brand-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
