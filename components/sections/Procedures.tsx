import Image from 'next/image';
import type { ProceduresContent } from '@/content/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { CheckDraw } from '@/components/ui/CheckDraw';
import { TiltCard } from '@/components/effects/TiltCard';
import { ButtonLink } from '@/components/ui/Button';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { scaleIn } from '@/lib/motion';

export function Procedures(content: ProceduresContent) {
  return (
    // 72px, matching "What is a Mommy Makeover" directly above so the top of
    // the page holds one rhythm. Centred sections read airier at the same
    // padding, so the internal gaps below are trimmed to match too.
    <section
      id="procedures"
      className="relative bg-[linear-gradient(180deg,var(--color-blush-50)_0%,var(--color-blush-100)_55%,var(--color-blush-50)_100%)] section-y"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow={content.eyebrow}
          heading={content.heading}
          align="center"
          className="mx-auto max-w-2xl"
        />

        <RevealGroup className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.items.map((item) => (
            <RevealItem key={item.id} variants={scaleIn} className="h-full">
              <TiltCard className="h-full">
                <article
                  id={item.id}
                  className="group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-[var(--radius-md)] border border-blush-200 bg-white shadow-[var(--shadow-card)] transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]"
                >
                  {/* Glow bloom behind the card on hover */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-px -z-10 rounded-[var(--radius-md)] bg-[image:var(--gradient-brand)] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40"
                  />

                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      quality={82}
                      sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 30vw"
                      className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(to_top,rgba(61,22,42,0.35),transparent_55%)]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-7">
                    <h3 className="font-display text-[1.5rem] font-semibold leading-tight text-plum-800">
                      {item.name}
                    </h3>

                    <p className="text-[0.9375rem] leading-[1.7] text-muted">
                      {item.description}
                    </p>

                    <ul className="mt-auto flex flex-col gap-3 pt-2">
                      {item.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3">
                          <CheckDraw />
                          <span className="pt-0.5 font-sans text-sm font-medium text-plum-800">
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>

        <GoldDivider className="mt-12" />

        <Reveal className="mt-7 flex flex-col items-center gap-5 text-center">
          <p className="max-w-md font-display text-[clamp(1.25rem,2vw,1.625rem)] italic leading-snug text-plum-700">
            {content.footerNote}
          </p>
          <ButtonLink href={content.cta.href} size="lg" magnetic>
            {content.cta.label}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
