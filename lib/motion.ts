import type { Variants } from 'motion/react';

/**
 * Shared motion language. Reference: docs/design-system.md §4.
 *
 * Only `transform` and `opacity` are ever animated.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

export const DUR = {
  micro: 0.18,
  fast: 0.32,
  base: 0.52,
  slow: 0.8,
} as const;

export const STAGGER = 0.08;

/** Entrances fire once — re-animating on scroll-back reads as cheap. */
export const VIEWPORT = { once: true, amount: 0.25 } as const;
export const VIEWPORT_LOOSE = { once: true, amount: 0.1 } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.base, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR.base, ease: EASE_OUT } },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  show: { opacity: 1, x: 0, transition: { duration: DUR.base, ease: EASE_OUT } },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  show: { opacity: 1, x: 0, transition: { duration: DUR.base, ease: EASE_OUT } },
};

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER, delayChildren: 0.1 } },
};

export const drawPath: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: DUR.slow, ease: EASE_OUT },
  },
};

/** Reduced-motion equivalents: a plain, quick fade with no movement. */
export const reducedFade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15 } },
};
