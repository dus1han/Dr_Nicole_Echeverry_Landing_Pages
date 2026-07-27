'use client';

import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useIsDesktop } from '@/lib/hooks';

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** Maximum pull toward the cursor, in pixels. */
  strength?: number;
};

/**
 * Pulls its child gently toward the cursor, springing back on leave.
 *
 * Desktop + pointer only. On touch devices this renders a plain wrapper with
 * no listeners and no motion values.
 */
export function Magnetic({ children, className, strength = 12 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 20, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 20, mass: 0.4 });

  const enabled = isDesktop && !reduced;

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        // Normalise by half-size so the pull is proportional, then cap it.
        x.set(Math.max(-strength, Math.min(strength, (dx / (r.width / 2)) * strength)));
        y.set(Math.max(-strength, Math.min(strength, (dy / (r.height / 2)) * strength)));
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
