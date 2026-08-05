import type { ReactNode, ElementType, CSSProperties } from 'react';
import { Children, isValidElement, cloneElement } from 'react';
import { fadeUp, type RevealVariant } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Scroll-triggered entrance. Fires once.
 *
 * SERVER components. They render a class and nothing else; a single
 * IntersectionObserver for the whole document (see RevealObserver) adds
 * `is-in` when each one arrives. That is the entire mechanism.
 *
 * Previously each of these was a Motion component. The page renders about
 * eighty of them across thirteen sections, and hydrating that many animation
 * components was the largest single contributor to a 5,250ms Total Blocking
 * Time on a mid-range phone. Nothing about the effect changed; it simply stopped
 * costing JavaScript.
 *
 * Without JS nothing adds `is-in`, so `.no-js .rv` in globals.css puts the
 * content back at full opacity — the animation is an enhancement, never a gate
 * on reading the page.
 */

type RevealProps = {
  children: ReactNode;
  /** Which entrance to use. Ignored under prefers-reduced-motion. */
  variants?: RevealVariant;
  className?: string;
  /** Seconds, matching the old Motion API. */
  delay?: number;
  as?: ElementType;
  /** Accepted for source compatibility; the shared observer sets the threshold. */
  amount?: number;
};

export function Reveal({
  children,
  variants = fadeUp,
  className,
  delay = 0,
  as: Tag = 'div',
}: RevealProps) {
  const style = delay ? ({ transitionDelay: `${delay}s` } as CSSProperties) : undefined;

  return (
    <Tag className={cn('rv', variants.reveal, className)} style={style}>
      {children}
    </Tag>
  );
}

/**
 * Staggers the `RevealItem`s inside it.
 *
 * The delay is set per child with a `--i` custom property rather than by the
 * parent orchestrating its children, which is what Motion's variant
 * propagation did. That propagation was also fragile — it silently stopped
 * crossing wrapper components, which is what once left the FAQ ticks and the
 * journey steps invisible.
 */
export function RevealGroup({
  children,
  className,
  as: Tag = 'div',
}: Omit<RevealProps, 'variants' | 'delay'>) {
  let i = 0;

  return (
    <Tag className={className}>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        const props = child.props as { style?: CSSProperties };
        return cloneElement(child as never, {
          style: { ...props.style, ['--i' as string]: i++ },
        });
      })}
    </Tag>
  );
}

export function RevealItem({
  children,
  className,
  variants = fadeUp,
  as: Tag = 'div',
  style,
}: Omit<RevealProps, 'delay' | 'amount'> & { style?: CSSProperties }) {
  return (
    <Tag className={cn('rv', variants.reveal, className)} style={style}>
      {children}
    </Tag>
  );
}
