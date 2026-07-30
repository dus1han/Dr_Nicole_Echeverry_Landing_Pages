'use client';

import { useEffect, useState, useCallback, useRef, useId } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ReviewsContent, Review } from '@/content/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { useIsDesktop } from '@/lib/hooks';
import { EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';

const AUTO_MS = 6500;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn('h-4 w-4', i < rating ? 'fill-gold-500 text-gold-500' : 'text-blush-200')}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, onOpen }: { review: Review; onOpen: () => void }) {
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const [clamped, setClamped] = useState(false);

  /*
   * "Read more" appears only when the text is genuinely cut off.
   *
   * Measured rather than guessed from character count: the same quote clamps at
   * one column and does not at three, and a "Read more" that opens a dialog
   * showing the identical paragraph reads as a broken control.
   */
  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [review.quote]);

  return (
    <article className="relative flex h-full flex-col gap-4 overflow-hidden rounded-[var(--radius-md)] border border-blush-200 bg-white p-7 shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]">
      <Quote className="absolute -right-2 -top-2 h-20 w-20 text-gold-400/18" aria-hidden="true" />

      {typeof review.rating === 'number' && <Stars rating={review.rating} />}

      {review.title && (
        <p className="relative font-display text-[1.0625rem] font-semibold leading-snug text-plum-800">
          {review.title}
        </p>
      )}

      {/*
        Clamped to five lines. These are real reviews and several run to a full
        paragraph — unclamped, one long card set the height of the whole row and
        the section grew by roughly half a viewport.
      */}
      <p
        ref={quoteRef}
        className="relative line-clamp-5 text-[0.9375rem] leading-[1.78] text-ink/85"
      >
        “{review.quote}”
      </p>

      {clamped && (
        <button
          type="button"
          onClick={onOpen}
          className="relative -my-1 flex min-h-11 items-center self-start font-sans text-[0.8125rem] font-semibold text-rose-600 underline decoration-rose-300 underline-offset-4 transition-colors hover:text-plum-800 hover:decoration-plum-800"
        >
          Read more
          <span className="sr-only"> of {review.name}’s review</span>
        </button>
      )}

      <div className="relative mt-auto border-t border-blush-200 pt-5">
        <p className="font-display text-base font-semibold text-plum-800">{review.name}</p>
        {review.descriptor && (
          <p className="mt-0.5 font-sans text-[0.8125rem] text-muted">{review.descriptor}</p>
        )}
      </div>
    </article>
  );
}

function ReviewModal({ review, onClose }: { review: Review; onClose: () => void }) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    // The page behind a dialog must not scroll, or a touch drag moves the page
    // instead of the review.
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      // Keep Tab inside the dialog. Without this, focus walks off into the page
      // behind it, which for a keyboard user means the dialog is still open and
      // they are somewhere else entirely.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.12 : 0.25, ease: EASE_OUT }}
    >
      <div
        className="absolute inset-0 bg-plum-900/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-[var(--radius-lg)] border border-blush-200 bg-white p-7 shadow-[var(--shadow-card)] outline-none sm:p-9"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: reduced ? 0.12 : 0.3, ease: EASE_OUT }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close review"
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-plum-700 transition-colors hover:bg-blush-50 hover:text-plum-900"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <Quote className="absolute -right-1 top-14 h-20 w-20 text-gold-400/15" aria-hidden="true" />

        {typeof review.rating === 'number' && (
          <div className="mb-4">
            <Stars rating={review.rating} />
          </div>
        )}

        <h3
          id={labelId}
          className="relative max-w-[calc(100%-3rem)] font-display text-[1.375rem] font-semibold leading-snug text-plum-800"
        >
          {review.title ?? `${review.name}’s review`}
        </h3>

        <p className="relative mt-5 whitespace-pre-line text-[0.9375rem] leading-[1.78] text-ink/85">
          “{review.quote}”
        </p>

        <div className="relative mt-7 border-t border-blush-200 pt-5">
          <p className="font-display text-base font-semibold text-plum-800">{review.name}</p>
          {review.descriptor && (
            <p className="mt-0.5 font-sans text-[0.8125rem] text-muted">{review.descriptor}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Reviews(content: ReviewsContent) {
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion();
  const perView = isDesktop ? 3 : 1;
  const pages = Math.max(1, Math.ceil(content.items.length / perView));
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState<Review | null>(null);

  // Guard against a stale page index when perView changes on resize.
  useEffect(() => {
    setPage((p) => Math.min(p, pages - 1));
  }, [pages]);

  const go = useCallback(
    (dir: 1 | -1) => setPage((p) => (p + dir + pages) % pages),
    [pages],
  );

  useEffect(() => {
    // `open` pauses it too: rotating the carousel under an open dialog means
    // closing it returns you to a different set of cards than you left.
    if (paused || open || reduced || pages < 2) return;
    const t = setInterval(() => setPage((p) => (p + 1) % pages), AUTO_MS);
    return () => clearInterval(t);
  }, [paused, open, reduced, pages]);

  const close = useCallback(() => setOpen(null), []);

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
                        onOpen={() => setOpen(review)}
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

      <AnimatePresence>
        {open && <ReviewModal key={open.name} review={open} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}
