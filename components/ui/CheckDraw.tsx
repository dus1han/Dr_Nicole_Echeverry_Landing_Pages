'use client';

import { motion, useReducedMotion } from 'motion/react';
import { DUR, EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Gold tick that draws itself on scroll.
 *
 * Triggers on its own `whileInView` rather than inheriting a variant from an
 * ancestor Reveal group. Inheritance broke once the tick sat behind extra
 * wrappers (the tilt card's transform layer), leaving every tick stuck at
 * opacity 0 — self-triggering is predictable wherever the component is used.
 */
const TONES = {
  light: 'bg-rose-500/10 ring-1 ring-rose-400/35',
  sage: 'bg-sage-500/12 ring-1 ring-sage-300/60',
  dark: 'bg-gold-400/15 ring-1 ring-gold-400/40',
} as const;

const STROKES = {
  light: 'var(--color-rose-600)',
  sage: 'var(--color-sage-700)',
  dark: 'var(--color-gold-400)',
} as const;

export function CheckDraw({
  className,
  tone = 'light',
}: {
  className?: string;
  tone?: keyof typeof TONES;
}) {
  const reduced = useReducedMotion();

  return (
    <span
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
        TONES[tone],
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <motion.path
          d="M4.5 12.5 L9.5 17.5 L19.5 6.5"
          stroke={STROKES[tone]}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduced ? 0 : DUR.slow, ease: EASE_OUT, delay: 0.15 }}
        />
      </svg>
    </span>
  );
}
