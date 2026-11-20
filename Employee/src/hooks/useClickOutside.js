import { useEffect, useRef } from 'react';

/**
 * Calls `onOutside` when a pointer-down happens outside every ref in `refs`,
 * or when Escape is pressed. Only listens while `enabled` is true.
 */
export function useClickOutside(refs, onOutside, enabled = true) {
  const handlerRef = useRef(onOutside);

  useEffect(() => {
    handlerRef.current = onOutside;
  }, [onOutside]);

  useEffect(() => {
    if (!enabled) return undefined;
    const onPointerDown = (event) => {
      const inside = refs.some((ref) => ref.current && ref.current.contains(event.target));
      if (!inside) handlerRef.current(event);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handlerRef.current(event);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
    // `refs` is a stable array literal of refs in practice; refs themselves never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
