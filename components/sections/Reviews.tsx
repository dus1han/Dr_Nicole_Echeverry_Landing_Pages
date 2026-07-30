'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react';
import type { ReviewsContent, Review } from '@/content/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { useIsDesktop } from '@/lib/hooks';
import { EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';

const AUTO_MS = 6500;

function ReviewCard({
  review,
  isPlaceholder,
}: {
  review: Review;
  isPlaceholder?: boolean;
}) {
  return (
    <article className="relative flex h-full flex-col gap-5 overflow-hidden rounded-[var(--radius-md)] border border-blush-200 bg-white p-8 shadow-[var(--shadow-card)]">
      <Quote
        className="absolute -right-2 -top-2 h-20 w-20 text-gold-400/18"
        aria-hidden="true"
      />
      {/* Stars render only for reviews that actually carry a rating. */}
      {typeof review.rating === 'number' && (
        <div className="flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < review.rating! ? 'fill-gold-500 text-gold-500' : 'text-blush-200',
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {review.title && (
        <p className="relative font-display text-[1.0625rem] font-semibold leading-snug text-plum-800">
          {review.title}
        </p>
      )}

      <p className="relative flex-1 text-[0.9375rem] leading-[1.78] text-ink/85">
        “{review.quote}”
      </p>

      <div className="relative border-t border-blush-200 pt-5">
        <p className="font-display text-base font-semibold text-plum-800">{review.name}</p>
        {review.descriptor && (
          <p className="mt-0.5 font-sans text-[0.8125rem] text-muted">{review.descriptor}</p>
        )}
        {/*
          Suppressed on placeholders — a "Verified patient" badge on a review
          marked SAMPLE contradicts itself, and the whole point of the ribbon
          is that dummy content never pretends to be real.
        */}
        {!isPlaceholder && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-gold-400/12 px-2.5 py-1">
            <BadgeCheck className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
            <span className="font-sans text-[11px] font-semibold text-plum-700">
              Verified patient
            </span>
          </span>
        )}
      </div>
    </article>
  );
}

export function Reviews(content: ReviewsContent) {
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion();
  const perView = isDesktop ? 3 : 1;
  const pages = Math.max(1, Math.ceil(content.items.length / perView));
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  // Guard against a stale page index when perView changes on resize.
  useEffect(() => {
    setPage((p) => Math.min(p, pages - 1));
  }, [pages]);

  const go = useCallback(
    (dir: 1 | -1) => setPage((p) => (p + dir + pages) % pages),
    [pages],
  );

  useEffect(() => {
    if (paused || reduced || pages < 2) return;
    const t = setInterval(() => setPage((p) => (p + 1) % pages), AUTO_MS);
    return () => clearInterval(t);
  }, [paused, reduced, pages]);

  const visible = content.items.slice(page * perView, page * perView + perView);

  return (
    <section
      id="reviews"
      className="relative bg-[linear-gradient(180deg,var(--color-blush-50)_0%,var(--color-blush-100)_55%,var(--color-blush-50)_100%)] section-y"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow={content.eyebrow}
          heading={content.heading}
          align="center"
          className="mx-auto max-w-2xl"
        />

        {/*
          Both on-page placeholder markers (the banner here and the SAMPLE
          ribbon on each card) were removed at the client's request. The only
          remaining guard is `npm run check:content`, which fails the build
          while `isPlaceholder` is true — see the note in Reviews' section of
          docs/section-review.md.
        */}
        <Reveal className="mt-10">
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            {/*
              Every page is rendered, stacked into ONE grid cell
              (`col-start-1 row-start-1`), with the inactive ones faded out.
              The container therefore takes the height of the TALLEST page and
              never changes.

              The previous version swapped pages with AnimatePresence
              mode="wait". Because quote lengths differ, each page had a
              different height — the section oscillated 710px ↔ 737px every
              6.5s, shifting the whole document by 27px. Parked at the bottom
              of the page that read as the page randomly jumping.
            */}
            <div className="grid">
              {Array.from({ length: pages }, (_, i) => {
                const isActive = i === page;
                const items = content.items.slice(i * perView, i * perView + perView);

                return (
                  <motion.div
                    key={i}
                    aria-hidden={!isActive}
                    className={cn(
                      'col-start-1 row-start-1 grid gap-6 md:grid-cols-2 lg:grid-cols-3',
                      !isActive && 'pointer-events-none',
                    )}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      y: reduced || isActive ? 0 : 12,
                    }}
                    transition={{ duration: reduced ? 0.15 : 0.42, ease: EASE_OUT }}
                  >
                    {items.map((review) => (
                      <ReviewCard
                        key={review.name}
                        review={review}
                        isPlaceholder={content.isPlaceholder}
                      />
                    ))}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous reviews"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-blush-200 bg-white text-plum-800 transition-all hover:border-rose-300 hover:shadow-[var(--shadow-sm)]"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: pages }, (_, i) => (
                  // The dot is 8px, but the hit area must clear 24px
                  // (WCAG 2.2 SC 2.5.8) — so the button is padded and the
                  // dot itself is an inner span.
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    aria-label={`Go to review page ${i + 1}`}
                    aria-current={i === page}
                    className="flex h-11 w-6 items-center justify-center"
                  >
                    <span
                      className={cn(
                        'block h-2 rounded-full transition-all duration-300',
                        i === page
                          ? 'w-8 bg-[image:var(--gradient-fill)]'
                          : 'w-2 bg-blush-200 hover:bg-rose-300',
                      )}
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next reviews"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-blush-200 bg-white text-plum-800 transition-all hover:border-rose-300 hover:shadow-[var(--shadow-sm)]"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
