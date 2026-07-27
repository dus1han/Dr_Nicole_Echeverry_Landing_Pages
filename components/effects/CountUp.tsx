'use client';

import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

/**
 * Counts up to `value` when scrolled into view. Runs once.
 *
 * Renders the final value immediately under prefers-reduced-motion, and the
 * final value is what server-renders — so the number is never missing.
 */
export function CountUp({ value, prefix = '', suffix = '', duration = 1.6, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    // Reset to zero on mount so the first paint after hydration can animate.
    if (!started.current && !inView) setDisplay(0);
    if (!inView || started.current) return;

    started.current = true;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <span className="tnum">{display.toLocaleString('en-US')}</span>
      {suffix}
    </span>
  );
}
