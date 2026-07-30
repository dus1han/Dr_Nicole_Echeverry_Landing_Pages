import Image from 'next/image';
import type { CandidacyContent } from '@/content/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { CheckDraw } from '@/components/ui/CheckDraw';
import { ButtonLink } from '@/components/ui/Button';
import { slideFromRight } from '@/lib/motion';

/**
 * Light section.
 *
 * This was the dark "breath" of the page, but a full-height block of deep
 * plum was the single heaviest thing on the page and read as anything but
 * calm. It is now soft blush. The closing CTA further down is the only dark
 * moment, which gives that section more impact for having the contrast to
 * itself.
 */
export function Candidacy(content: CandidacyContent) {
  return (
    <section
      id="candidacy"
      // 72px, matching sections 3 and 4 above.
      className="section-y relative overflow-hidden bg-[linear-gradient(180deg,var(--color-sage-100)_0%,var(--color-sage-50)_65%,var(--color-cream)_100%)]"
    >
      {/* Ambient layers removed for scroll performance — see WhatIsIt.tsx. */}

      <div className="container-page relative z-10">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="flex flex-col gap-8">
            <SectionHeading eyebrow={content.eyebrow} heading={content.heading} />

            <Reveal>
              <p className="max-w-[58ch] text-[1.0625rem] leading-[1.78] text-ink/80">
                {content.body}
              </p>
            </Reveal>

            <Reveal>
              <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-plum-700">
                {content.leadIn}
              </p>
            </Reveal>

            <RevealGroup className="flex flex-col gap-4">
              {content.criteria.map((item) => (
                <RevealItem key={item} className="flex items-start gap-4">
                  <CheckDraw tone="sage" />
                  <span className="pt-0.5 text-[0.9375rem] leading-[1.7] text-ink/85">
                    {item}
                  </span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          {/* Sticky image rail — desktop only; on mobile it would just add scroll. */}
          <Reveal variants={slideFromRight} className="hidden lg:block">
            <div className="sticky top-28">
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-full bg-rose-300/40 blur-[70px]"
              />
              <div className="relative aspect-3/4 overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] ring-1 ring-white/70">
                <Image
                  src={content.image.src}
                  alt={content.image.alt}
                  fill
                  quality={82}
                  sizes="42vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>

        {/*
          The closing line was removed at the client's request, which left the
          banner card holding nothing but a button — a wide bordered box with a
          single control in it reads as an unfinished layout.

          So the card goes with it and the CTA becomes a centred button under
          the grid. That is the shape the Procedures and Before & After sections
          already end on, so this section now closes the way the rest of the
          page does rather than in a treatment of its own.
        */}
        <Reveal className="mt-12 flex justify-center">
          <ButtonLink href={content.cta.href} size="lg" magnetic>
            {content.cta.label}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
