import Image from 'next/image';
import type { HeroContent } from '@/content/types';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Full-bleed editorial hero: three photographs dissolving behind fixed copy.
 *
 * It replaces a boxed portrait sitting beside a column of text — the most
 * common hero on the internet, and one that made this page look like every
 * other clinic's. The photographs are all shot with the subject to the right
 * and open space to the left, so a full-bleed treatment uses the composition
 * the photographer actually framed instead of cropping it into a card.
 *
 * Still a SERVER component with pure-CSS animation, for the reason the previous
 * version documented and which has not changed: a Motion entrance renders at
 * opacity 0 until React hydrates, which once left this headline invisible for
 * ~4.3s and made it the LCP element. Nothing here waits for JavaScript.
 *
 * The aurora and the petal canvas are gone from this section. Behind a
 * full-bleed photograph neither is visible, and the canvas was one of only two
 * left on the page after the scroll-performance work.
 */

const rise = (delay: number) => ({
  className: 'anim-rise',
  style: { animationDelay: `${delay}s` },
});

/** 24s cycle ÷ 3 frames. Negative, so each starts part-way through — see globals.css. */
const FRAME_STAGGER = -8;

export function Hero(content: HeroContent) {
  return (
    <section className="hero-shell grain relative isolate overflow-hidden bg-cream">
      {/* ---------------- Photograph layer ---------------- */}
      {/*
        A band above the copy on phones, the whole section behind it from lg.

        The band is deliberate rather than a fallback. The client asked for the
        photograph to lead on mobile, and an earlier version that put copy first
        pushed the primary CTA to y=807 on an 844px viewport — below the fold.
        16/10 keeps the image cinematic while leaving the button reachable.
      */}
      <div className="relative aspect-16/10 w-full sm:aspect-21/9 lg:absolute lg:inset-0 lg:aspect-auto lg:h-full">
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
            quality={80}
            sizes="100vw"
            data-hero-frame={i}
            style={{ animationDelay: `${i * FRAME_STAGGER}s` }}
            /*
              object-position leans right on narrow screens: the subject is
              right-of-centre, so a centred crop of a 16:9 frame into a 16:10
              band puts empty room on screen and the body half out of it.
              From lg the frame is full-bleed and the default centre is correct.
            */
            className="anim-hero-cross absolute inset-0 h-full w-full object-cover object-[72%_50%] lg:object-center"
          />
        ))}

        {/*
          Two scrims, one per layout.

          Mobile: bottom-up into cream, so the band melts into the copy beneath
          rather than ending on a hard edge.

          Desktop: left-to-right, opaque where the text sits and clear over the
          subject. This is what guarantees contrast — the copy is effectively on
          cream no matter which frame is showing, so the type never has to be
          legible against a photograph.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-cream)_2%,rgba(254,250,248,0.35)_38%,transparent_70%)] lg:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden lg:block lg:bg-[linear-gradient(100deg,var(--color-cream)_0%,var(--color-cream)_38%,rgba(254,250,248,0.9)_54%,rgba(254,250,248,0.3)_72%,transparent_88%)]"
        />
        {/* Softens the join into the section below at every width. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,var(--color-cream),transparent)]"
        />
      </div>

      {/* ---------------- Copy ---------------- */}
      {/*
        pt clears the fixed header, which is 117px tall until the announcement
        marquee collapses on scroll. On mobile the band already sits above this,
        so only the desktop overlay needs the allowance.
      */}
      <div className="container-page relative z-10 pb-12 pt-10 lg:flex lg:min-h-[min(88svh,820px)] lg:items-center lg:pb-24 lg:pt-[8.5rem]">
        {/*
          38rem, not narrower. At 34rem the focal line broke into three ragged
          lines — "Mommy / Makeover / in Dubai" — which is the exact failure the
          previous hero carried a comment about. "Mommy Makeover" needs roughly
          520px to hold one line at this size, and the column has to clear that
          before anything else about the layout is worth judging.
        */}
        <div className="flex max-w-xl flex-col items-start gap-6 lg:max-w-[38rem]">
          <h1 className="relative font-display tracking-[-0.02em]">
            {/*
              A radial-gradient, not a blur filter — the scroll-performance work
              on this page established that a large `filter: blur()` re-rasterises
              on every scroll frame and a gradient does not.
            */}
            <span
              aria-hidden="true"
              className="anim-glow pointer-events-none absolute -left-[8%] top-[20%] h-[70%] w-[85%] rounded-full bg-[radial-gradient(closest-side,rgb(232_138_171/0.38),transparent)]"
            />

            <span
              className="anim-rise relative block text-[clamp(1.25rem,2.4vw,1.875rem)] font-medium leading-[1.15] text-plum-700"
              style={{ animationDelay: '0.06s' }}
            >
              {content.headline.leadIn}
            </span>

            {/*
              Two nested spans on purpose: `.anim-rise` and `.anim-headline`
              both set `animation`, so on a single element the later rule would
              silently cancel the other. Outer owns the entrance, inner the
              perpetual sheen.
            */}
            <span className="anim-rise relative mt-2 block" style={{ animationDelay: '0.14s' }}>
              <span className="anim-headline block text-[clamp(2.375rem,5vw,4.25rem)] font-bold leading-[1.02]">
                {content.headline.focus}
              </span>
            </span>
          </h1>

          <p
            {...rise(0.28)}
            className="anim-rise font-display text-[clamp(1.0625rem,1.7vw,1.375rem)] italic text-plum-700"
          >
            {content.attribution}
          </p>

          {/*
            A hairline rule rather than more copy. It gives the block an
            editorial spine and separates the claim from the promise without
            adding a word the visitor has to read.
          */}
          <span
            {...rise(0.32)}
            aria-hidden="true"
            className="anim-rise block h-px w-24 bg-[linear-gradient(90deg,var(--color-gold-500),transparent)]"
          />

          <p
            {...rise(0.36)}
            className="anim-rise max-w-[44ch] text-[clamp(1rem,1.3vw,1.1875rem)] leading-[1.65] text-ink/75"
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
    </section>
  );
}
