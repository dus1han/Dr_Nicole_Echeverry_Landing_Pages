import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Subtle lift on hover for primary buttons.
 *
 * This used to track the pointer with two springs, which meant a mousemove
 * listener and two animation values per button — real main-thread work for an
 * effect only mouse users ever saw, and one that cost every mobile visitor the
 * library to serve it.
 *
 * A CSS transform on hover reads almost identically and runs on the compositor.
 * Touch devices have no hover state, so they now pay nothing at all.
 */
export function Magnetic({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn('magnetic', className)}>{children}</span>;
}
