'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';
import type { ReactNode, ElementType } from 'react';
import { fadeUp, reducedFade, staggerParent, VIEWPORT } from '@/lib/motion';

type RevealProps = {
  children: ReactNode;
  /** Which entrance to use. Ignored under prefers-reduced-motion. */
  variants?: Variants;
  className?: string;
  delay?: number;
  as?: ElementType;
  amount?: number;
};

/**
 * Scroll-triggered entrance. Fires once.
 *
 * Content is always in the DOM at full opacity if JS never runs — the
 * animation is an enhancement, not a gate on the content.
 */
export function Reveal({
  children,
  variants = fadeUp,
  className,
  delay = 0,
  as = 'div',
  amount,
}: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as 'div'] ?? motion.div;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={amount ? { once: true, amount } : VIEWPORT}
      variants={reduced ? reducedFade : variants}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </MotionTag>
  );
}

/** Wraps children so each `RevealItem` inside enters in sequence. */
export function RevealGroup({
  children,
  className,
  as = 'div',
  amount,
}: Omit<RevealProps, 'variants' | 'delay'>) {
  const MotionTag = motion[as as 'div'] ?? motion.div;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={amount ? { once: true, amount } : VIEWPORT}
      variants={staggerParent}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className,
  variants = fadeUp,
  as = 'div',
}: Omit<RevealProps, 'delay' | 'amount'>) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as 'div'] ?? motion.div;

  return (
    <MotionTag className={className} variants={reduced ? reducedFade : variants}>
      {children}
    </MotionTag>
  );
}
