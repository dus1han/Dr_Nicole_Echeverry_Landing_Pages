'use client';

import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { useIsDesktop } from '@/lib/hooks';

/**
 * A soft rose light that trails the pointer.
 *
 * Fixed, pointer-events-none, soft-light blended so it warms whatever is
 * underneath without obscuring it. Desktop + pointer only.
 */
export function CursorGlow() {
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion();
  const enabled = isDesktop && !reduced;

  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const sx = useSpring(x, { stiffness: 120, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 120, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-[90] h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 mix-blend-soft-light"
      style={{
        left: sx,
        top: sy,
        background:
          'radial-gradient(closest-side, rgba(221,110,150,0.6), rgba(221,110,150,0) 70%)',
      }}
    />
  );
}
