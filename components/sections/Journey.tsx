'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'motion/react';
import type { JourneyContent } from '@/content/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';

/**
 * Horizontal process timeline.
 *
 * Was a stacked vertical list, which ran to ~1250px for five short steps — a
 * lot of scrolling for information the visitor only needs to skim. Laid out
 * five-across, the whole process is visible in one glance and the section is
 * roughly a third of the height. Below `lg` it becomes a compact grid rather
 * than a long column.
 */
export function Journey(content: JourneyContent) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // The connector fills left-to-right as the section scrolls through — it
  // turns an abstract list into visible forward motion.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 85%', 'end 65%'],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  return (
    <section
      id="journey"
      className="relative overflow-hidden bg-[linear-gradient(180deg,var(--color-cream)_0%,var(--color-sage-50)_50%,var(--color-cream)_100%)] section-y"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/3 h-[30rem] w-[30rem] rounded-full bg-rose-300/18 blur-[110px]"
      />

      <div className="container-page relative">
        <SectionHeading
          eyebrow={content.eyebrow}
          heading={content.heading}
          lead={content.lead}
          align="center"
          className="mx-auto max-w-2xl"
        />

        {/*
          The connectors live on this wrapper, not inside the <ol>, so the list
          itself can be the reveal group. Wrapping the items in a
          `display: contents` element instead gave that element no bounding box,
          so its whileInView observer never fired and every step stayed at
          opacity 0 — only the connector line rendered.
        */}
        <div ref={ref} className="relative mt-12">
          {/*
            Connector, desktop only. Inset to 10% each side so it starts and
            ends at the centre of the first and last badges (5 columns → badge
            centres sit at 10%, 30%, 50%, 70%, 90%).
          */}
          {/*
            The unfilled track. It was `sage-200` on a sage-tinted background,
            which is barely a shade apart — before the pink fill scrolled in,
            the steps looked disconnected. `sage-300` reads clearly against the
            wash while still letting the pink fill show progress on top of it.
          */}
          <span
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-sage-300 lg:block"
          />
          <motion.span
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-7 hidden h-px origin-left bg-[image:var(--gradient-brand)] lg:block"
            style={reduced ? { scaleX: 1 } : { scaleX }}
          />

          <RevealGroup
            as="ol"
            className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5"
          >
            {content.steps.map((step, i) => (
              <RevealItem
                key={step.title}
                as="li"
                className="relative flex flex-col items-start gap-3.5 lg:items-center lg:text-center"
              >
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-cream font-display text-lg font-bold text-plum-700 shadow-[var(--shadow-sm)]">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <h3 className="font-display text-lg font-semibold leading-snug text-plum-800">
                  {step.title}
                </h3>

                <p className="max-w-[36ch] text-[0.875rem] leading-[1.65] text-muted">
                  {step.description}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
