'use client';

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useIsDesktop } from '@/lib/hooks';
import { cn } from '@/lib/utils';

const MAX_DEG = 8;

/**
 * 3D tilt following the cursor, with a pink glow that blooms behind on hover.
 *
 * Desktop + pointer only — on touch the card renders plain with no motion
 * values and no listeners attached.
 */
export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion();
  const enabled = isDesktop && !reduced;

  // -0.5 … 0.5, relative position of the pointer within the card.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const spring = { stiffness: 150, damping: 18, mass: 0.5 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [MAX_DEG, -MAX_DEG]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-MAX_DEG, MAX_DEG]), spring);

  if (!enabled) {
    return <div className={cn('relative', className)}>{children}</div>;
  }

  return (
    // h-full on the perspective wrapper too — without it the height chain
    // breaks (grid → RevealItem h-full → THIS → article h-full) and cards in
    // the same row stop matching heights.
    <div className="h-full [perspective:1000px]">
      <motion.div
        ref={ref}
        className={cn('relative [transform-style:preserve-3d]', className)}
        style={{ rotateX, rotateY }}
        onPointerMove={(e) => {
          const el = ref.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width - 0.5);
          py.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
