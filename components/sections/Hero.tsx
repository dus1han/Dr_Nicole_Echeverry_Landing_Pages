import Image from 'next/image';
import type { HeroContent } from '@/content/types';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Full-bleed editorial hero: photographs at full strength, copy on its own card.
 *
 * The first attempt laid a pale cream gradient across the left half so the type
 * would be legible on top of the picture. It worked and it looked washed out —
 * a LIGHT scrim over a photograph does not darken it, it drains it, and these
 * images are soft neutrals to begin with so there was nothing left to drain.
 *
 * So the wash is gone. The photograph is at full strength edge to edge, and the
 * copy sits on a near-solid card floating above it. Contrast stops being a
 * gradient stop someone has to tune and becomes text on cream, which cannot
 * fail. The layering is also what makes it feel expensive: one flat plane reads
 * as a stock header, two planes with a shadow between them read as a magazine
 * spread.
 *
 * Still a SERVER component animated in pure CSS. A Motion entrance renders at
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
        A tall band above the copy on phones, the whole section behind it from
        lg. The band leads on mobile at the client's request, and an earlier
        version that put copy first pushed the primary CTA below the fold on an
        844px viewport.
      */}
      <div className="relative aspect-4/3 w-full sm:aspect-21/9 lg:absolute lg:inset-0 lg:aspect-auto lg:h-full">
        {content.frames.map((frame, i) => (
          <Image
            key={frame.src}
            src={frame.src}
            alt={frame.alt}
            fill
            // Only the first frame is a real LCP candidate; the others dissolve
            // in seconds later and must not compete for bandwidth with it.
            priority={i === 0}
            fetchPriority={i === 0 ? 'high' : 'low'}
            loading={i === 0 ? 'eager' : 'lazy'}
            // 86, not 80. The sources are 1672px wide and this is now shown at
            // full strength rather than under a wash, so compression artefacts
            // that the scrim used to hide are visible.
            quality={86}
            sizes="100vw"
            data-hero-frame={i}
            style={{ animationDelay: `${i * FRAME_STAGGER}s` }}
            /*
              Leans right on narrow screens: the subject is right-of-centre, so
              a centred crop of a 16:9 frame into a portrait-ish band puts empty
              room on screen and the body half out of it.
            */
            className="anim-hero-cross absolute inset-0 h-full w-full object-cover object-[70%_50%] lg:object-center"
          />
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

        {/* Melts the band into the copy on mobile, and the section into the next one at every width. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,var(--color-cream),transparent)]"
        />
      </div>

      {/* ---------------- Copy card ---------------- */}
      <div className="container-page relative z-10 pb-14 lg:flex lg:min-h-[min(90svh,860px)] lg:items-center lg:py-28">
        {/*
          -mt on mobile lifts the card over the photograph's lower edge. That
          overlap is the whole trick: it turns two stacked blocks into one
          composition, and costs a margin.
        */}
        {/*
          Width is set by the headline, not by taste. "Mommy Makeover" has to
          hold one line — broken into "Mommy / Makeover / in Dubai" it loses the
          impact the whole hero exists for. Measured: it needs 541px at the 64px
          desktop size, so the card is 40rem with 40px padding, leaving 560px.
        */}
        <div className="relative -mt-16 w-full max-w-xl sm:-mt-24 lg:mt-0 lg:max-w-[40rem]">
          {/*
            A gold hairline offset behind the card, echoing the framing used on
            the surgeon's portrait further down the page. Hidden on mobile,
            where there is no room for it to read as anything but clutter.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden translate-x-3 translate-y-3 rounded-[2rem] border border-gold-500/35 lg:block"
          />

          {/*
            bg-cream/95, not solid. The five per cent lets the photograph ghost
            through just enough to tie the card to what is behind it, and text
            on 95% cream is still, for contrast purposes, text on cream.
          */}
          <div className="anim-scale-in relative flex flex-col items-start gap-6 rounded-[2rem] border border-white/70 bg-cream/95 p-7 shadow-[var(--shadow-lift)] sm:p-9 lg:p-10">
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
                {/* Lower bound is 2.125rem, not 2.25: at 36px the phrase needed
                    302px and a 390px phone leaves 292px inside the card. */}
                <span className="anim-headline block text-[clamp(2.125rem,4.4vw,4rem)] font-bold leading-[1.02]">
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
