'use client';

import { useEffect, useState } from 'react';

/**
 * True only for pointer-capable, wide viewports.
 *
 * Gates the expensive desktop-only effects (tilt, cursor glow, magnetic
 * buttons, particle canvas) so phones never mount or run them.
 *
 * Starts `false` so the server render and first client render agree — no
 * hydration mismatch, and no flash of desktop-only chrome on mobile.
 */
export function useIsDesktop(minWidth = 1024): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px) and (hover: hover)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [minWidth]);

  return isDesktop;
}

/** True once the window has scrolled past `threshold` pixels. */
export function useScrolledPast(threshold = 60): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return past;
}

/** Locks body scroll while `locked` is true (mobile menu overlay). */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}
