import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { X } from 'lucide-react';
import { tweenFrom, tweenTo, usePresence } from '../lib/animate';
import { cx } from '../utils/cx';

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function modalIn(el) {
  const [overlay, panel] = el.children;
  return gsap
    .timeline()
    .add(tweenFrom(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 }), 0)
    .add(tweenFrom(panel, { autoAlpha: 0, y: 28, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.3)' }), 0);
}

function modalOut(el, onComplete) {
  const [overlay, panel] = el.children;
  return gsap
    .timeline({ onComplete })
    .add(tweenTo(overlay, { autoAlpha: 0, duration: 0.15 }), 0)
    .add(tweenTo(panel, { autoAlpha: 0, y: 18, scale: 0.98, duration: 0.15, ease: 'power2.in' }), 0);
}

// Stack of open modal ids, so Escape / focus trapping only affect the top one.
const modalStack = [];

/**
 * Accessible modal dialog: portal, focus trap, Escape to close, scroll lock,
 * focus restore, and bottom-sheet layout on small screens.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  size = 'md',
  dismissible = true,
  initialFocusRef,
}) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  const [mounted, containerRef] = usePresence(open, modalIn, modalOut);

  useEffect(() => {
    onCloseRef.current = onClose;
    dismissibleRef.current = dismissible;
  });

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    modalStack.push(id);
    document.body.style.overflow = 'hidden';

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target =
        initialFocusRef?.current ??
        panel.querySelector('[data-autofocus]') ??
        panel.querySelector(`[data-modal-body] :is(${FOCUSABLE})`) ??
        panel;
      target.focus();
    });

    const onKeyDown = (event) => {
      if (modalStack[modalStack.length - 1] !== id) return;
      if (event.key === 'Escape') {
        if (dismissibleRef.current) {
          event.stopPropagation();
          onCloseRef.current?.();
        }
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusables = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      const index = modalStack.lastIndexOf(id);
      if (index !== -1) modalStack.splice(index, 1);
      if (modalStack.length === 0) document.body.style.overflow = '';
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [open, id, initialFocusRef]);

  if (!mounted) return null;

  return createPortal(
    <div ref={containerRef} className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={dismissible ? onClose : undefined} aria-hidden="true" />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={cx(
              'relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-white shadow-pop outline-none sm:rounded-2xl',
              SIZES[size] ?? SIZES.md,
            )}
          >
            <header className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
              {icon}
              <div className="min-w-0 flex-1 pt-0.5">
                <h2 id={titleId} className="text-base font-bold text-ink sm:text-lg">
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="mt-0.5 text-sm text-muted">
                    {description}
                  </p>
                )}
              </div>
              {dismissible && (
                <button type="button" onClick={onClose} className="icon-btn -mt-1 -mr-2" aria-label="Close dialog">
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </header>
            <div data-modal-body className="scroll-thin flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {children}
            </div>
            {footer && (
              <footer className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                {footer}
              </footer>
            )}
          </div>
    </div>,
    document.body,
  );
}
