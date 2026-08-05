'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Seconds. */
  duration?: number;
  className?: string;
};

/**
 * Counts up to `value` when scrolled into view. Runs once.
 *
 * The final value is what server-renders, so the number is never missing and
 * never shifts layout — the count is decoration on top of correct output.
 *
 * Hand-rolled rather than pulling in an animation library for one number. It is
 * a single requestAnimationFrame loop that stops when it finishes; the library
 * version cost far more than the effect is worth.
 */
export function CountUp({ value, prefix = '', suffix = '', duration = 1.6, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const ms = duration * 1000;
        // The same curve as the rest of the page's motion language.
        const ease = (t: number) => 1 - (1 - t) ** 3;

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / ms);
          setDisplay(Math.round(ease(t) * value));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setDisplay(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <span className="tnum">{display.toLocaleString('en-US')}</span>
      {suffix}
    </span>
  );
}
