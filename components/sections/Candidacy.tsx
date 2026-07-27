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
          Full-width closing banner.

          This used to sit at the bottom of the left column, which left a large
          dead area under the image on the right. Spanning both columns fills
          the width and gives the CTA far more presence — quote on the left,
          button on the right, stacked on mobile.
        */}
        <Reveal className="mt-12">
          <div className="flex flex-col gap-7 rounded-[var(--radius-lg)] border border-sage-200 bg-white/70 p-8 shadow-[var(--shadow-sm)] backdrop-blur-sm sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <p className="max-w-[54ch] font-display text-[clamp(1.25rem,2.2vw,1.75rem)] italic leading-snug text-plum-800">
              {content.closing}
            </p>
            <ButtonLink
              href={content.cta.href}
              size="lg"
              magnetic
              className="shrink-0 self-start lg:self-auto"
            >
              {content.cta.label}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
