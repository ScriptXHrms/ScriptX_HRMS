import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Ellipsis } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import { tweenFrom, tweenTo, usePresence } from '../lib/animate';
import { cx } from '../utils/cx';

const ITEM_HEIGHT = 40;

const menuIn = (el) => tweenFrom(el, { autoAlpha: 0, scale: 0.96, y: -4 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.12, ease: 'power2.out' });
const menuOut = (el, onComplete) => tweenTo(el, { autoAlpha: 0, scale: 0.96, duration: 0.1, onComplete });

/**
 * Row action menu ("…"). Rendered in a portal with fixed positioning so it is
 * never clipped by scrollable table containers.
 * items = [{ label, icon, onClick, tone?: 'danger', disabled? }]
 */
export default function ActionMenu({ items, label = 'Open actions' }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const [mounted, menuRef] = usePresence(open, menuIn, menuOut);

  const close = useCallback((event) => {
    setOpen(false);
    if (event?.type === 'keydown') buttonRef.current?.focus();
  }, []);

  useClickOutside([buttonRef, menuRef], close, open);

  const computePosition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const menuHeight = items.length * ITEM_HEIGHT + 12;
    const openUp = rect.bottom + menuHeight + 8 > window.innerHeight && rect.top > menuHeight + 8;
    return {
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
      right: Math.max(8, window.innerWidth - rect.right),
      visible: rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth,
    };
  }, [items.length]);

  // Follow the button while scrolling; close once it leaves the viewport.
  useEffect(() => {
    if (!open) return undefined;
    const onViewportChange = () => {
      const next = computePosition();
      if (!next || !next.visible) setOpen(false);
      else setPosition(next);
    };
    window.addEventListener('scroll', onViewportChange, true);
    window.addEventListener('resize', onViewportChange);
    menuRef.current?.querySelector('[role="menuitem"]:not(:disabled)')?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('scroll', onViewportChange, true);
      window.removeEventListener('resize', onViewportChange);
    };
  }, [open, computePosition, menuRef]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setPosition(computePosition());
    setOpen(true);
  };

  const onMenuKeyDown = (event) => {
    const options = [...menuRef.current.querySelectorAll('[role="menuitem"]:not(:disabled)')];
    const index = options.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      options[(index + 1) % options.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      options[(index - 1 + options.length) % options.length]?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="icon-btn h-9 w-9"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={toggle}
      >
        <Ellipsis size={18} aria-hidden="true" />
      </button>
      {mounted &&
        position &&
        createPortal(
            <div
              ref={menuRef}
              role="menu"
              aria-label={label}
              style={{ position: 'fixed', top: position.top, bottom: position.bottom, right: position.right }}
              className="z-[70] min-w-[200px] rounded-xl border border-line bg-white p-1.5 shadow-pop"
              onKeyDown={onMenuKeyDown}
            >
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      setOpen(false);
                      item.onClick();
                    }}
                    className={cx(
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50',
                      item.tone === 'danger'
                        ? 'text-red-600 hover:bg-red-50 focus-visible:bg-red-50'
                        : 'text-ink hover:bg-brand-50 hover:text-brand-700 focus-visible:bg-brand-50 focus-visible:text-brand-700',
                    )}
                  >
                    {Icon && <Icon size={16} aria-hidden="true" />}
                    {item.label}
                  </button>
                );
              })}
            </div>,
          document.body,
        )}
    </>
  );
}
