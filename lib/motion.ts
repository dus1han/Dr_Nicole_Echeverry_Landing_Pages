/**
 * Shared motion language. Reference: docs/design-system.md §4.
 *
 * These used to be Framer/Motion `Variants`. They are now plain tokens naming a
 * CSS class, because the animation library they fed was costing ~5.2s of Total
 * Blocking Time on a mid-range phone — most of it hydrating the ~80 `Reveal`
 * components the page renders.
 *
 * The names and the import sites are unchanged, so the thirteen sections that
 * pass `variants={scaleIn}` still read the same. Only the implementation moved
 * from JavaScript to a stylesheet.
 *
 * Only `transform` and `opacity` are ever animated, as before.
 */

export type RevealVariant = { readonly reveal: string };

export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const EASE_IN_OUT = 'cubic-bezier(0.4, 0, 0.2, 1)';

export const DUR = {
  micro: 180,
  fast: 320,
  base: 520,
  slow: 800,
} as const;

/** Gap between staggered children, in ms. Mirrors `--i` in globals.css. */
export const STAGGER = 80;

export const fadeUp: RevealVariant = { reveal: 'rv-up' };
export const fadeIn: RevealVariant = { reveal: 'rv-fade' };
export const scaleIn: RevealVariant = { reveal: 'rv-scale' };
export const slideFromLeft: RevealVariant = { reveal: 'rv-left' };
export const slideFromRight: RevealVariant = { reveal: 'rv-right' };
