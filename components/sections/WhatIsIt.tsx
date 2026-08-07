import Image from 'next/image';
import { ArrowDownRight } from 'lucide-react';
import type { WhatIsItContent } from '@/content/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { slideFromLeft } from '@/lib/motion';

export function WhatIsIt(content: WhatIsItContent) {

  return (
    // Tighter than the shared `section-y` (144px), tuned against the hero and
    // trust strip directly above it so the top of the page reads as one rhythm.
    <section
      id="what-is-it"
      className="section-y relative overflow-hidden bg-[linear-gradient(180deg,var(--color-cream)_0%,var(--color-blush-50)_50%,var(--color-cream)_100%)]"
    >
      {/*
        Ambient layers removed here for scroll performance. Aurora blobs, a
        petal canvas and a grain overlay in six separate sections were
        cumulatively costing more than any single one of them — measured at
        ~9fps while scrolling. They are now concentrated in the hero, the
        doctor section and the closing CTA, where they actually register.
      */}
      <div className="container-page relative z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image */}
        <Reveal variants={slideFromLeft} className="relative order-2 lg:order-1">
          <div
            aria-hidden="true"
            className="absolute -inset-5 rounded-[3rem] bg-[image:var(--gradient-aura)] opacity-45 blur-2xl"
          />

          {/* Offset gold outline — the couture detail. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-4 translate-y-4 rounded-[var(--radius-lg)] border border-gold-400/50 lg:translate-x-6 lg:translate-y-6"
          />

          <div
           
            className="relative aspect-4/5 overflow-hidden rounded-[var(--radius-lg)] bg-plum-900 shadow-[var(--shadow-card)]"
          >
            {/* Parallax on a view-progress timeline: no scroll listener, no transform
                recalculated in JS. Falls back to a static image, which is what
                it looked like at rest anyway. */}
            <div className="anim-parallax absolute inset-[-6%]">
              <Image
                src={content.image.src}
                alt={content.image.alt}
                fill
                quality={85}
                sizes="(max-width: 1023px) 92vw, 46vw"
                className="object-cover"
              />
            </div>

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(to_top,rgba(61,22,42,0.72),transparent_55%)]"
            />

            <p className="absolute bottom-5 left-6 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-blush-100/90">
              {content.imageCaption}
            </p>
          </div>
        </Reveal>

        {/* Copy */}
        <div className="order-1 flex flex-col gap-8 lg:order-2">
          <SectionHeading eyebrow={content.eyebrow} heading={content.heading} />

          <Reveal>
            <p className="max-w-[58ch] text-[1.0625rem] leading-[1.75] text-ink/80">
              {content.body}
            </p>
          </Reveal>

          {/*
            Optional. /breast-lift's line counted the procedures, which stopped
            being true once breast reduction was added, and the chips below say
            the same thing more directly anyway.
          */}
          {content.leadIn && (
            <Reveal>
              <p className="flex items-start gap-2 font-sans text-sm font-semibold text-plum-700">
                <ArrowDownRight
                  className="mt-0.5 h-4 w-4 shrink-0 text-gold-500"
                  aria-hidden="true"
                />
                {content.leadIn}
              </p>
            </Reveal>
          )}

          <RevealGroup className="flex flex-wrap gap-3">
            {content.chips.map((chip) => (
              <RevealItem key={chip.href}>
                <a
                  href={chip.href}
                  className="group inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-blush-200 bg-white px-5 py-2.5 font-sans text-sm font-semibold text-plum-800 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-[var(--shadow-card)]"
                >
                  <span className="h-1.5 w-1.5 rotate-45 bg-[image:var(--gradient-brand)] transition-transform duration-300 group-hover:rotate-[135deg]" />
                  {chip.label}
                </a>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
