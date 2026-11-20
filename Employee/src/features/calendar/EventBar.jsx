import { CATEGORY_STYLES } from './calendarUtils';
import { useRiseIn } from '../../lib/animate';
import { formatTime } from '../../utils/dateUtils';
import { cx } from '../../utils/cx';

/** A one-line task placed in a CSS grid row: all-day lanes and the month view. */
export default function EventBar({ bar, index, onOpen, className }) {
  const ref = useRiseIn(index);
  const { event } = bar;
  const styles = CATEGORY_STYLES[event.category];

  return (
    <button
      ref={ref}
      type="button"
      title={event.task.title}
      onClick={() => onOpen(event)}
      style={{ gridColumn: `${bar.from + 1} / span ${bar.span}`, gridRow: bar.lane + 1 }}
      className={cx('mx-0.5 flex h-[22px] min-w-0 items-center gap-1.5 rounded-md border px-1.5 text-left text-[11px] font-semibold text-ink transition-shadow hover:shadow-card', styles.card, className)}
    >
      <span className={cx('h-1.5 w-1.5 shrink-0 rounded-full', styles.dot)} aria-hidden="true" />
      <span className="truncate">
        {event.timed && <span className={cx('mr-1', styles.time)}>{formatTime(event.task.startTime)}</span>}
        {event.task.title}
      </span>
    </button>
  );
}
