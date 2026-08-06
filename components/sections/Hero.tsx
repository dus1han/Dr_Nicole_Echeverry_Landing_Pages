
import type { CSSProperties } from 'react';
import type { HeroContent } from '@/content/types';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Full-bleed editorial hero: three photographs dissolving behind the copy.
 *
 * Two earlier attempts are worth recording, because both looked reasonable in
 * isolation and neither survived contact with the page.
 *
 * A pale cream gradient across the left half made the type legible and drained
 * the picture — a LIGHT scrim over a photograph does not darken it, and these
 * are soft neutrals with nothing to spare. Then a near-solid card carrying the
 * copy fixed contrast but read as a box pasted over the picture, and on a phone
 * it took most of the screen.
 *
 * What works is neither: the photograph runs at full strength, and the words sit
 * directly on it over a soft pool of cream that is dense behind the text and
 * gone by the time it reaches the body. Legibility without a hard edge.
 *
 * Phones get a genuinely different crop rather than the same frame squeezed —
 * see the `picture` element below.
 *
 * A SERVER component animated in pure CSS. A JavaScript entrance renders at
 * opacity 0 until React hydrates, which once left this headline invisible for
 * ~4.3s while it was the LCP element.
 */

const rise = (delay: number) => ({
  className: 'anim-rise',
  style: { animationDelay: `${delay}s` },
});

/** 24s cycle ÷ 3 frames. Negative, so each starts part-way through — see globals.css. */
const FRAME_STAGGER = -8;

export function Hero(content: HeroContent) {
  return (
    <section className="relative isolate overflow-hidden bg-cream">
      {/* ---------------- Photograph layer ---------------- */}
      {/*
        Full-bleed behind the copy at EVERY width.

        It used to be a band above the text on phones, with the copy on cream
        beneath it. That stacked arrangement gave the pale block most of the
        screen and looked nothing like the desktop treatment. Now the phone gets
        the same idea: photograph edge to edge, words on top of it.

        The picture still leads — the top two thirds are clear image, and the
        copy sits in the lower third where the scrim has faded up to cream.
      */}
      <div className="absolute inset-0 h-full w-full">
        {/*
          `picture`, not next/image, because this needs ART DIRECTION rather
          than a resize. A 16:9 frame stretched over a tall phone viewport crops
          so hard that only a narrow vertical slice survives and the subject
          reads as an abstract close-up; the phone gets a genuinely different
          crop, composed around the torso.
          next/image cannot express that, and there is nothing to give up here —
          `prepare-assets` already emits both at 43–67KB, so this also skips the
          /_next/image round trip on the LCP element.

          The `-portrait` companion is derived rather than listed in content
          because the same script writes both, so the pair cannot drift apart.
        */}
        {content.frames.map((frame, i) => (
          <picture key={frame.src}>
            <source
              media="(max-width: 767px)"
              srcSet={frame.src.replace(/\.jpg$/, '-portrait.jpg')}
              width={706}
              height={941}
            />
            <img
              src={frame.src}
              alt={frame.alt}
              width={1672}
              height={941}
              // Only the first frame is a real LCP candidate; the others
              // dissolve in seconds later and must not compete for bandwidth.
              fetchPriority={i === 0 ? 'high' : 'low'}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding={i === 0 ? 'sync' : 'async'}
              data-hero-frame={i}
              style={{ animationDelay: `${i * FRAME_STAGGER}s` }}
              className="anim-hero-cross absolute inset-0 h-full w-full object-cover object-center"
            />
          </picture>
        ))}

        {/*
          A vignette, not a wash. It deepens the corners and leaves the centre
          untouched, so the picture gains depth instead of losing contrast — the
          opposite of what the cream gradient did. A radial-gradient, so it
          costs no blur and no extra raster.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(125%_105%_at_68%_38%,transparent_38%,rgb(88_64_73/0.30)_100%)]"
        />

        {/*
          No scrim under the header here — the Navbar now carries its own, so
          every section is protected rather than just this one.
        */}

        {/*
          The copy's backing, per layout.

          On a phone it is a vertical fade: clear image across the top, resolving
          to cream by the lower third where the words are. Desktop keeps the
          radial pool on the left instead, which is on the copy block itself.

          Both stop well short of opaque across the whole frame — that was the
          washed-out version, and the point here is that the photograph reads.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--color-cream)_16%,rgb(254_250_248/0.92)_34%,rgb(254_250_248/0.35)_56%,transparent_74%)] lg:hidden"
        />

        {/* Joins the section to the one below it at every width. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,var(--color-cream),transparent)]"
        />
      </div>

      {/* ---------------- Copy card ---------------- */}
      {/*
        The section's height now comes from here, since the photograph is
        absolutely positioned at every width. min-h on mobile is what keeps the
        image visible above the copy; `justify-end` drops the words into the
        lower third where the scrim has reached cream.
      */}
      <div className="container-page relative z-10 flex min-h-[86svh] flex-col justify-end pb-12 pt-32 lg:min-h-[min(90svh,860px)] lg:justify-center lg:py-28">
        {/*
          Width is set by the headline, not by taste. "Mommy Makeover" has to
          hold one line — broken into "Mommy / Makeover / in Dubai" it loses the
          impact the whole hero exists for. Measured: it needs 541px at the 64px
          desktop size, so this is 40rem.
        */}
        <div className="relative w-full max-w-xl lg:max-w-[40rem]">
          {/*
            No card, no border, no shadow — the type sits on the photograph.
            The panel version read as a box pasted over the picture and took up
            most of the frame; this keeps the image the subject and lets the
            words belong to it.

            Legibility comes from a soft pool of cream behind the text rather
            than a hard edge: dense where the words are, gone before it reaches
            the body. A radial-gradient, so it costs no blur and no extra
            raster — the same reasoning as the headline glow.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-8 -inset-y-10 -z-10 hidden rounded-[3rem] bg-[radial-gradient(75%_72%_at_26%_50%,rgb(254_250_248/0.95)_0%,rgb(254_250_248/0.86)_42%,rgb(254_250_248/0)_78%)] lg:block"
          />

          <div className="anim-scale-in relative flex flex-col items-start gap-5">
            <h1 className="relative font-display tracking-[-0.02em]">
              {/*
                A radial-gradient, not a blur filter — the scroll-performance
                work on this page established that a large `filter: blur()`
                re-rasterises on every scroll frame and a gradient does not.
              */}
              <span
                aria-hidden="true"
                className="anim-glow pointer-events-none absolute left-[-10%] top-[18%] h-[72%] w-[88%] rounded-full bg-[radial-gradient(closest-side,rgb(232_138_171/0.40),transparent)]"
              />

              <span
                className="anim-rise relative block text-[clamp(1.125rem,2.2vw,1.75rem)] font-medium leading-[1.15] text-plum-700"
                style={{ animationDelay: '0.06s' }}
              >
                {content.headline.leadIn}
              </span>

              {/*
                Two nested spans on purpose: `.anim-rise` and `.anim-headline`
                both set `animation`, so on one element the later rule would
                silently cancel the other. Outer owns the entrance, inner the
                perpetual sheen.
              */}
              <span className="anim-rise relative mt-2 block" style={{ animationDelay: '0.14s' }}>
                {/*
                  Sized to the title it is given, not to a fixed scale.

                  The type was tuned so "Mommy Makeover" holds one line. A
                  second page arrived with "Breast Lift & Augmentation" — half
                  again as long — and it broke to three lines, which is exactly
                  the failure the tuning existed to prevent. Shrinking the scale
                  for everyone would have made the shorter title needlessly
                  small.

                  So the scale is divided by how long the title actually is,
                  computed on the server with no runtime cost. 28 characters is
                  the pivot: at or under it nothing changes, and beyond it the
                  size falls off in proportion. Measured against both pages.
                */}
                <span
                  className="anim-headline hero-focus block font-bold leading-[1.02]"
                  style={{ '--hero-k': Math.min(1, 28 / content.headline.focus.length) } as CSSProperties}
                >
                  {content.headline.focus}
                </span>
              </span>
            </h1>

            <p
              {...rise(0.28)}
              className="anim-rise font-display text-[clamp(1rem,1.6vw,1.3125rem)] italic text-plum-700"
            >
              {content.attribution}
            </p>

            <span
              {...rise(0.32)}
              aria-hidden="true"
              className="anim-rise block h-px w-24 bg-[linear-gradient(90deg,var(--color-gold-500),transparent)]"
            />

            <p
              {...rise(0.36)}
              className="anim-rise max-w-[42ch] text-[clamp(1rem,1.25vw,1.125rem)] leading-[1.65] text-ink/75"
            >
              {content.subheadline}
            </p>

            <div {...rise(0.44)} className="anim-rise flex flex-wrap items-center gap-4 pt-1">
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
          </div>
        </div>
      </div>
    </section>
  );
}
