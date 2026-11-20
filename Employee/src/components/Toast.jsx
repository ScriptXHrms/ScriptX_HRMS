import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { ToastContext } from '../context/ToastContext';
import { tweenFrom, tweenTo } from '../lib/animate';
import { cx } from '../utils/cx';

const VARIANTS = {
  success: { icon: CircleCheck, iconClass: 'bg-green-50 text-green-600', bar: 'bg-green-600' },
  error: { icon: CircleAlert, iconClass: 'bg-red-50 text-red-600', bar: 'bg-red-600' },
  warning: { icon: TriangleAlert, iconClass: 'bg-orange-50 text-orange-600', bar: 'bg-orange-500' },
  info: { icon: Info, iconClass: 'bg-brand-50 text-brand-700', bar: 'bg-brand-700' },
};

const MAX_VISIBLE = 4;
let toastCounter = 0;

function ToastItem({ toast, onDismiss, onExited }) {
  const variant = VARIANTS[toast.type] ?? VARIANTS.info;
  const Icon = variant.icon;
  const ref = useRef(null);

  useLayoutEffect(() => {
    const tween = toast.leaving
      ? tweenTo(ref.current, { autoAlpha: 0, x: 32, duration: 0.16, onComplete: () => onExited(toast.id) })
      : tweenFrom(ref.current, { autoAlpha: 0, y: 16, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.4)' });
    return () => tween.kill();
  }, [toast.leaving, toast.id, onExited]);

  return (
    <div
      ref={ref}
      role={toast.type === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border border-line bg-white py-3.5 pr-11 pl-4 shadow-pop"
    >
      <span className={cx('absolute inset-y-0 left-0 w-1', variant.bar)} aria-hidden="true" />
      <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', variant.iconClass)}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.message && <p className="mt-0.5 text-sm leading-snug text-muted">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="absolute top-2.5 right-2.5 rounded-lg p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink"
        aria-label="Dismiss notification"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/** App-wide toast notifications. Use the `useToast()` hook to show one. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (type, title, message, { duration = 4500 } = {}) => {
      toastCounter += 1;
      const id = `toast-${toastCounter}`;
      setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { id, type, title, message }]);
      if (duration > 0) timers.current.set(id, setTimeout(() => dismiss(id), duration));
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach((timer) => clearTimeout(timer));
  }, []);

  const api = useMemo(
    () => ({
      success: (title, message, options) => push('success', title, message, options),
      error: (title, message, options) => push('error', title, message, { duration: 6500, ...options }),
      warning: (title, message, options) => push('warning', title, message, { duration: 6000, ...options }),
      info: (title, message, options) => push('info', title, message, options),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2.5 p-4 sm:right-0 sm:left-auto sm:items-end sm:p-6"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} onExited={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
export { useToast } from '../hooks/useToast';
