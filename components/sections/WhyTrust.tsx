import { Palette, UserCog, Scale, HeartHandshake } from 'lucide-react';
import type { WhyTrustContent, PillarIcon } from '@/content/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { scaleIn } from '@/lib/motion';

const ICONS: Record<PillarIcon, typeof Palette> = {
  artistry: Palette,
  personalised: UserCog,
  harmony: Scale,
  care: HeartHandshake,
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

        <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.pillars.map((pillar) => {
            const Icon = ICONS[pillar.icon];
            return (
              <RevealItem key={pillar.title} variants={scaleIn} className="h-full">
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
                    min-h of two lines: the titles wrap to one or two lines
                    depending on length, which left the descriptions starting at
                    different heights across the row.
                  */}
                  <h3 className="min-h-[2.6em] font-display text-xl font-semibold leading-snug text-plum-800">
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
