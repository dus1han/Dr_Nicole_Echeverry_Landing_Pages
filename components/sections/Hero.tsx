import Image from 'next/image';
import type { HeroContent } from '@/content/types';
import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/SectionHeading';
import { AuroraBackground } from '@/components/effects/AuroraBackground';
import { PetalCanvas } from '@/components/effects/PetalCanvas';

/**
 * The hero is a SERVER component and its entrance animations are pure CSS.
 *
 * This is deliberate. Motion entrances render at opacity 0 and only reveal
 * once React hydrates — on a throttled mobile profile that left the headline
 * invisible for ~4.3s and made it the LCP element. CSS animations start at
 * first paint, so the copy is on screen as soon as it is parsed and the whole
 * section ships zero JavaScript beyond the (desktop-only) petal canvas.
 *
 * `--d` sets each element's stagger delay.
 */

const rise = (delay: number) => ({
  className: 'anim-rise',
  style: { animationDelay: `${delay}s` },
});

export function Hero(content: HeroContent) {
  const [line1, ...rest] = content.headline;

  return (
    // Top padding must clear the fixed header, which is 117px tall before the
    // announcement marquee collapses on scroll. pt-28 (112px) tucked the
    // eyebrow underneath it, so the floor here is ~124px, not lower.
    <section className="grain relative overflow-hidden bg-[linear-gradient(180deg,var(--color-blush-50)_0%,var(--color-cream)_55%,var(--color-blush-50)_100%)] pb-7 pt-[7.75rem] lg:pb-11 lg:pt-[8.25rem]">
      <AuroraBackground />
      <PetalCanvas />

      <div className="container-page relative z-10 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* ---------------- Copy ---------------- */}
        <div className="flex flex-col items-start gap-7">
          <div {...rise(0.05)}>
            <Eyebrow>{content.eyebrow}</Eyebrow>
          </div>

          {/*
            Line 1 is the emotional hook and carries the size. The remaining
            lines name the procedure and sit subordinate — at equal size the
            longer line swamped the hook and pushed the CTAs below the fold.
          */}
          <h1 className="font-display font-bold tracking-[-0.02em] text-plum-800">
            <span
              className="anim-rise block text-[clamp(2.5rem,6vw,4.75rem)] leading-[1]"
              style={{ animationDelay: '0.12s' }}
            >
              {line1}
            </span>
            {rest.map((line, i) => (
              <span
                key={line}
                className="anim-rise mt-2 block text-gradient text-[clamp(1.5rem,3.4vw,2.75rem)] font-semibold leading-[1.12]"
                style={{ animationDelay: `${0.2 + i * 0.08}s` }}
              >
                {line}
              </span>
            ))}
          </h1>

          <p
            {...rise(0.3)}
            className="anim-rise font-display text-[clamp(1.125rem,1.8vw,1.5rem)] italic text-plum-700"
          >
            {content.attribution}
          </p>

          <p
            {...rise(0.36)}
            className="anim-rise max-w-[46ch] text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-[1.65] text-muted"
          >
            {content.subheadline}
          </p>

          <div
            {...rise(0.44)}
            className="anim-rise flex flex-wrap items-center gap-4 pt-2"
          >
            <ButtonLink href={content.primaryCta.href} size="lg" magnetic>
              {content.primaryCta.label}
            </ButtonLink>
            <ButtonLink
              href={content.secondaryCta.href}
              variant="secondary"
              size="lg"
              withArrow
            >
              {content.secondaryCta.label}
            </ButtonLink>
          </div>

          {/*
            The badge list that used to sit here duplicated the two floating
            glass badges over the image — same two strings, twice on one
            screen. Removed; the badges over the image carry them.
          */}
        </div>

        {/* ---------------- Image ---------------- */}
        <div
          className="anim-scale-in relative mx-auto w-full max-w-lg lg:max-w-none"
          style={{ animationDelay: '0.18s' }}
        >
          <div
            aria-hidden="true"
            className="absolute -inset-6 rounded-[3rem] bg-[image:var(--gradient-aura)] opacity-70 blur-2xl"
          />

          <div className="relative overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)] ring-1 ring-white/60 lg:rounded-[2.5rem]">
            <Image
              src={content.image.src}
              alt={content.image.alt}
              width={1254}
              height={1254}
              priority
              fetchPriority="high"
              quality={82}
              sizes="(max-width: 1023px) 92vw, 46vw"
              className="anim-ken-burns h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(to_top,rgba(61,22,42,0.28),transparent_45%)]"
            />
          </div>

          {/* Floating glass badges */}
          <div className="anim-bob absolute -left-3 top-[14%] hidden rounded-[var(--radius-pill)] border border-white/60 bg-white/75 px-4 py-2.5 shadow-[var(--shadow-sm)] backdrop-blur-md sm:block">
            <span className="font-sans text-xs font-semibold tracking-wide text-plum-800">
              {content.badges[0]}
            </span>
          </div>
          <div
            className="anim-bob absolute -right-3 bottom-[16%] hidden rounded-[var(--radius-pill)] border border-white/60 bg-white/75 px-4 py-2.5 shadow-[var(--shadow-sm)] backdrop-blur-md sm:block"
            style={{ animationDelay: '1.6s' }}
          >
            <span className="font-sans text-xs font-semibold tracking-wide text-plum-800">
              {content.badges[1]}
            </span>
          </div>
        </div>
      </div>

    </section>
  );
}
