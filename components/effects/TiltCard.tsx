import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Card that lifts and tilts slightly under the pointer.
 *
 * Previously three spring-driven motion values recalculated on every
 * pointermove. Now a CSS transform on hover: the same impression of depth,
 * evaluated by the compositor, and nothing at all on a touch device — which is
 * where it was never visible anyway.
 *
 * `h-full` is preserved on the wrapper. Without it the perspective element
 * collapsed to its content height and left the procedure cards uneven.
 */
export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('tilt-card h-full', className)}>{children}</div>;
}
