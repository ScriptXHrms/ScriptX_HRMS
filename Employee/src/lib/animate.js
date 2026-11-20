import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const CLEAR = 'transform,opacity,visibility';

/** gsap.fromTo that jumps straight to the end for people who prefer reduced motion. */
export function tweenFrom(targets, from, to) {
  const reduced = prefersReducedMotion();
  return gsap.fromTo(targets, from, { clearProps: CLEAR, ...to, ...(reduced ? { duration: 0, delay: 0, stagger: 0 } : {}) });
}

export function tweenTo(targets, to) {
  return gsap.to(targets, { ...to, ...(prefersReducedMotion() ? { duration: 0, delay: 0 } : {}) });
}

export const dropdownIn = (el) => tweenFrom(el, { autoAlpha: 0, y: -6, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.16, ease: 'power2.out' });
export const dropdownOut = (el, onComplete) => tweenTo(el, { autoAlpha: 0, y: -6, scale: 0.98, duration: 0.12, ease: 'power2.in', onComplete });

/**
 * Keeps an element mounted while its exit tween plays.
 *   const [mounted, ref] = usePresence(open, dropdownIn, dropdownOut);
 */
export function usePresence(open, enter, exit) {
  const [mounted, setMounted] = useState(open);
  const ref = useRef(null);
  const handlers = useRef({ enter, exit });
  handlers.current = { enter, exit };

  if (open && !mounted) setMounted(true);

  useLayoutEffect(() => {
    if (!mounted || !ref.current) return undefined;
    const tween = open ? handlers.current.enter(ref.current) : handlers.current.exit(ref.current, () => setMounted(false));
    return () => tween?.kill?.();
  }, [open, mounted]);

  return [mounted, ref];
}

/** Fades a block in when `dependency` changes, e.g. the route path. */
export function useFadeIn(dependency) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    const tween = tweenFrom(ref.current, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' });
    return () => tween.kill();
  }, [dependency]);
  return ref;
}

/** Entrance with a small index-based delay, used by stat tiles and lists. */
export function useRiseIn(index = 0) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    const tween = tweenFrom(ref.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, delay: Math.min(index, 8) * 0.04, ease: 'power2.out' });
    return () => tween.kill();
  }, [index]);
  return ref;
}
