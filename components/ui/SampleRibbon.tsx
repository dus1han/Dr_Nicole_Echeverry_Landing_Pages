import { cn } from '@/lib/utils';

/**
 * Corner ribbon marking placeholder content.
 *
 * Rendered only while a content block has `isPlaceholder: true`. Deliberately
 * visible — the point is that dummy content can never be mistaken for the real
 * thing during a client review. `npm run check:content` blocks the build while
 * any such block remains.
 */
export function SampleRibbon({
  className,
  corner = 'top',
}: {
  className?: string;
  /** 'bottom' keeps the ribbon clear of top-corner labels. */
  corner?: 'top' | 'bottom';
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute -right-11 z-20 bg-plum-900/90 px-12 py-1 shadow-[var(--shadow-sm)]',
        corner === 'top' ? 'top-5 rotate-45' : 'bottom-5 -rotate-45',
        className,
      )}
      aria-hidden="true"
    >
      <span className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-gold-400">
        Sample
      </span>
    </div>
  );
}

/** Inline banner for a whole placeholder section. */
export function PlaceholderNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mx-auto flex max-w-xl items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-gold-400/40 bg-gold-400/10 px-4 py-2.5 text-center font-sans text-xs font-medium tracking-wide text-plum-700">
      {children}
    </p>
  );
}
