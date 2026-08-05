import { cn } from '@/lib/utils';

/**
 * A gold hairline that draws itself outward when it scrolls into view.
 *
 * Server-rendered; the shared reveal observer adds `is-in` and CSS does the
 * rest. It used to be a Motion component animating scaleX.
 */
export function GoldDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('flex items-center justify-center gap-3', className)}
    >
      <span className="rv rv-draw h-px w-16 origin-right bg-[linear-gradient(90deg,transparent,var(--color-gold-500))] sm:w-24" />
      <span className="rv rv-fade h-1.5 w-1.5 rotate-45 bg-gold-500/70" />
      <span className="rv rv-draw h-px w-16 origin-left bg-[linear-gradient(90deg,var(--color-gold-500),transparent)] sm:w-24" />
    </div>
  );
}
