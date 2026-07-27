'use client';

import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { DUR, EASE_OUT } from '@/lib/motion';

/** Hairline rule that fades at both ends, with a rotated diamond at centre. */
export function GoldDivider({
  className,
  tone = 'light',
}: {
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={cn('relative flex w-full items-center justify-center', className)}
      initial={reduced ? { opacity: 0 } : { opacity: 0, scaleX: 0.3 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: DUR.slow, ease: EASE_OUT }}
    >
      <span
        className={cn(
          'h-px w-full max-w-3xl',
          tone === 'dark'
            ? 'bg-[linear-gradient(90deg,transparent,rgba(217,185,140,0.55),transparent)]'
            : 'bg-[linear-gradient(90deg,transparent,rgba(201,160,99,0.45),transparent)]',
        )}
      />
      <span
        className={cn(
          'absolute h-1.5 w-1.5 rotate-45',
          tone === 'dark' ? 'bg-gold-400' : 'bg-gold-500',
        )}
      />
    </motion.div>
  );
}
