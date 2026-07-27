import type { TrustStripContent } from '@/content/types';
import { CountUp } from '@/components/effects/CountUp';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';

export function TrustStrip({ stats }: TrustStripContent) {
  return (
    <section className="relative border-y border-rose-300/50 bg-blush-200/70">
      <RevealGroup className="container-page grid grid-cols-2 gap-y-8 py-7 sm:py-8 lg:grid-cols-4">
        {stats.map((stat) => (
          <RevealItem
            key={stat.label}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <CountUp
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              className="font-display text-[clamp(2rem,3.6vw,3rem)] font-bold leading-none text-gradient"
            />
            <span className="max-w-[16ch] font-sans text-[0.8125rem] font-medium leading-snug text-muted">
              {stat.label}
            </span>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
