import Image from 'next/image';
import type { HeroContent } from '@/content/types';
import { ButtonLink } from '@/components/ui/Button';
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
  return (
    // Top padding must clear the fixed header, which is 117px tall before the
    // announcement marquee collapses on scroll. pt-28 (112px) tucked the first
    // line underneath it, so the floor here is ~124px, not lower.
    <section className="grain relative overflow-hidden bg-[linear-gradient(180deg,var(--color-blush-50)_0%,var(--color-cream)_55%,var(--color-blush-50)_100%)] pb-7 pt-[7.75rem] lg:pb-11 lg:pt-[8.25rem]">
      <AuroraBackground />
      <PetalCanvas />

      {/*
        Text column widened from 1.05fr to 1.2fr: at 1.05 the focal line broke
        into three ragged lines ("Mommy / Makeover / in Dubai"). Giving the copy
        more width keeps the type large AND lets "Mommy Makeover" hold one line,
        which is the better trade for a headline that has to land instantly.
      */}
      <div className="container-page relative z-10 grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        {/* ---------------- Copy ---------------- */}
        <div className="flex flex-col items-start gap-6">
          {/*
            The FOCUS line carries the size and the gradient — it is the phrase
            the visitor is searching for. The lead-in sits above it, smaller, as
            an emotional opener. This is the inverse of the first version, which
            made "Feel Like Yourself Again" the hero and buried the treatment
            name underneath it.
          */}
          <h1 className="font-display tracking-[-0.02em]">
            <span
              className="anim-rise block text-[clamp(1.375rem,2.6vw,2rem)] font-medium leading-[1.15] text-plum-700"
              style={{ animationDelay: '0.06s' }}
            >
              {content.headline.leadIn}
            </span>

            {/*
              Capped at 4.5rem so "Mommy Makeover" holds one line in this
              column — at 5.25rem it broke to "Mommy / Makeover / in Dubai",
              three ragged lines that cost more impact than the extra size won.
            */}
            <span
              className="anim-rise text-gradient mt-2 block text-[clamp(2.5rem,5.4vw,4.5rem)] font-bold leading-[1.02]"
              style={{ animationDelay: '0.14s' }}
            >
              {content.headline.focus}
            </span>
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

          {/*
            No floating badges over the photograph — they covered the image and
            repeated claims the copy already makes. The `badges` field was
            removed from HeroContent with them, so nothing dead is left behind.
          */}
        </div>
      </div>

    </section>
  );
}
