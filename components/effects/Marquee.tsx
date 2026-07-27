import { cn } from '@/lib/utils';

/**
 * Infinite horizontal scroll.
 *
 * The track is duplicated and translated -50%, so the loop is seamless. The
 * duplicate is aria-hidden — screen readers hear the list once.
 */
export function Marquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const Track = ({ hidden }: { hidden?: boolean }) => (
    <ul
      className="flex shrink-0 items-center gap-10 pr-10"
      aria-hidden={hidden ? 'true' : undefined}
    >
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex items-center gap-10 whitespace-nowrap">
          <span className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-plum-700">
            {item}
          </span>
          <span
            aria-hidden="true"
            className="h-1 w-1 shrink-0 rotate-45 bg-gold-500/80"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cn('group relative flex overflow-hidden', className)}>
      <div className="anim-marquee flex group-hover:[animation-play-state:paused]">
        <Track />
        <Track hidden />
      </div>
    </div>
  );
}
