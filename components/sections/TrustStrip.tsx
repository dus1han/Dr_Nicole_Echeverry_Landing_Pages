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
            {'value' in stat ? (
              <CountUp
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                className="font-display text-[clamp(2rem,3.6vw,3rem)] font-bold leading-none text-gradient"
              />
            ) : (
              /*
                Word figures are set a little smaller than the numerals.
                "Personalized" is twelve characters, and at the numeral size it
                overflows a half-width column on a phone; at this size the two
                kinds still read as one row, because the numerals are short and
                the words are long.
              */
              <span className="font-display text-[clamp(1.5rem,3vw,2.75rem)] font-bold leading-none text-gradient">
                {stat.text}
              </span>
            )}

            {/* Uppercase and letterspaced, matching the eyebrow treatment used
                across the page — it reads as a caption to the figure rather
                than as a second line of copy. */}
            <span className="max-w-[22ch] font-sans text-[0.75rem] font-semibold uppercase leading-snug tracking-[0.12em] text-muted">
              {stat.label}
            </span>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
