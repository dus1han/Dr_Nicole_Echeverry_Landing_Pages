import { Palette, UserCog, Scale, HeartHandshake, UsersRound } from 'lucide-react';
import type { WhyTrustContent, PillarIcon } from '@/content/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { scaleIn } from '@/lib/motion';
import { cn } from '@/lib/utils';

const ICONS: Record<PillarIcon, typeof Palette> = {
  artistry: Palette,
  personalised: UserCog,
  harmony: Scale,
  care: HeartHandshake,
  team: UsersRound,
};

export function WhyTrust(content: WhyTrustContent) {
  return (
    // Cream-based, not blush: "Meet Your Surgeon" above ends on blush-50, so a
    // blush start here left no visible boundary between the two sections.
    <section
      id="why-trust"
      className="relative bg-[linear-gradient(180deg,var(--color-cream)_0%,var(--color-blush-50)_55%,var(--color-cream)_100%)] section-y"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow={content.eyebrow}
          heading={content.heading}
          align="center"
          className="mx-auto max-w-2xl"
        />

        {/*
          Four across, unless there are five — then three and a centred two.

          A fifth pillar on a four-column grid drops alone onto the next row and
          reads as a missing sixth. Five abreast would fix the raggedness by
          making every card too narrow for its description. So five lays out on
          a six-column grid with each card spanning two and the fourth starting
          at column two, which centres the pair beneath the trio.
        */}
        <RevealGroup
          className={cn(
            'mt-10 grid gap-6 sm:grid-cols-2',
            content.pillars.length === 5 ? 'lg:grid-cols-6' : 'lg:grid-cols-4',
          )}
        >
          {content.pillars.map((pillar, i) => {
            const Icon = ICONS[pillar.icon];
            const fiveUp = content.pillars.length === 5;
            return (
              <RevealItem
                key={pillar.title}
                variants={scaleIn}
                className={cn(
                  'h-full',
                  fiveUp && 'lg:col-span-2',
                  fiveUp && i === 3 && 'lg:col-start-2',
                )}
              >
                <article className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-[var(--radius-md)] border border-blush-200 bg-white p-7 shadow-[var(--shadow-sm)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-card)]">
                  {/* Gradient top edge grows in from the left on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[image:var(--gradient-brand)] transition-transform duration-500 group-hover:scale-x-100"
                  />

                  <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[image:var(--gradient-fill)] text-white shadow-[var(--shadow-sm)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>

                  {/*
                    min-h of two lines, but only from `sm` — the breakpoint where
                    the grid actually becomes multi-column. It exists so titles of
                    different lengths don't leave the descriptions starting at
                    different heights across a row.

                    Below `sm` there is no row to align to: one card per line, and
                    the reserved second line just became a gap under every
                    single-line title.
                  */}
                  <h3 className="font-display text-xl font-semibold leading-snug text-plum-800 sm:min-h-[2.6em]">
                    {pillar.title}
                  </h3>

                  <p className="text-[0.9375rem] leading-[1.7] text-muted">
                    {pillar.description}
                  </p>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
