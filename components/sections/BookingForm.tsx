'use client';

import { useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import type { BookingContent } from '@/content/types';
import { consultationSchema } from '@/lib/consultation-schema';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { LEAD_FLAG, readClickId } from '@/lib/analytics';
import { EASE_OUT } from '@/lib/motion';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type Errors = Partial<Record<string, string>>;

/**
 * `slug` comes from the page rather than being hardcoded, so this component
 * works unchanged on every landing page — it only needs to know where its own
 * thank-you page lives.
 */
export function BookingForm({ slug, ...content }: BookingContent & { slug: string }) {
  const reduced = useReducedMotion();
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const fd = new FormData(event.currentTarget);
    const payload = {
      name: String(fd.get('name') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      email: String(fd.get('email') ?? ''),
      website: String(fd.get('website') ?? ''),
      ...readClickId(),
    };

    const parsed = consultationSchema.safeParse(payload);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ''])),
      );
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setStatus('error');
        setFormError(json.error ?? 'Something went wrong. Please call or WhatsApp us.');
        return;
      }

      setStatus('success');

      /*
       * Flag first, then navigate. The thank-you page reads the flag, fires the
       * conversion once and clears it, so refreshes and shared links cannot
       * fire a second one.
       *
       * A hard navigation, not router.push: a client-side route change is not
       * a page load, so any GTM trigger the marketing team builds on Page View
       * or on a URL rule would silently never fire. This guarantees a real page
       * load and leaves them free to trigger on either.
       */
      try {
        window.sessionStorage.setItem(LEAD_FLAG, '1');
      } catch {
        // Storage blocked — the confirmation still shows, only tracking is lost.
      }
      window.location.assign(`/${slug}/thank-you`);
    } catch {
      setStatus('error');
      setFormError(
        'We couldn’t reach the server. Please WhatsApp or call us — we’ll respond straight away.',
      );
    }
  }

  return (
    <section
      id="book"
      className="relative scroll-mt-24 overflow-hidden bg-[linear-gradient(180deg,var(--color-sage-50)_0%,var(--color-cream)_70%,var(--color-blush-50)_100%)] section-y"
    >
      {/* Aurora removed for scroll performance — see WhatIsIt.tsx. */}

      {/*
        One centred column. The supporting copy, the assurances and the privacy
        line were all removed at the client's request, which left the two-column
        split with nothing in its left half — so the form became the section
        rather than sitting beside an empty space.

        max-w-xl, not the full container: a three-field form stretched to the
        page width reads as harder work than it is, and long input lines are
        measurably slower to scan.

        The width sits on an inner wrapper rather than alongside `container-page`
        — both set max-width, and which won would depend on stylesheet order.
      */}
      <div className="container-page relative z-10">
        <div className="mx-auto flex max-w-xl flex-col gap-8">
        <SectionHeading
          heading={content.heading}
          align="center"
          headingClassName="text-[clamp(1.875rem,3.4vw,2.75rem)]"
        />

        {/*
          id="book-form" is the mobile scroll target. On phones the "Book"
          buttons jump straight here so the form is on screen immediately; on
          desktop they land on the section so the heading is read first.
          See components/layout/BookAnchor.tsx.
        */}
        {/*
          scroll-mt-4, not -24: html already sets `scroll-padding-top: 5.5rem`
          for the sticky header, and the two stack. A larger margin here left
          ~100px of dead space above the first field after a mobile tap.
        */}
        {/*
          The h-full stretching that used to be on these three elements is gone
          with the column it was matching — the card now sizes to its contents.
        */}
        <div id="book-form" className="scroll-mt-4">
          <Reveal>
            <div className="relative rounded-[var(--radius-lg)] bg-[image:var(--gradient-brand)] p-px shadow-[var(--shadow-card)]">
              <div className="rounded-[calc(var(--radius-lg)-1px)] bg-white p-7 sm:p-9">
              {status === 'success' ? (
                <motion.div
                  className="flex min-h-80 flex-col items-center justify-center gap-5 text-center"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 ring-1 ring-rose-400/40">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
                      <motion.path
                        d="M4.5 12.5 L9.5 17.5 L19.5 6.5"
                        stroke="var(--color-rose-600)"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: reduced ? 1 : 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: reduced ? 0 : 0.7, ease: EASE_OUT, delay: 0.15 }}
                      />
                    </svg>
                  </span>
                  <h3 className="font-display text-3xl font-semibold text-plum-800">
                    {content.successTitle}
                  </h3>
                  <p className="max-w-sm text-[0.9375rem] leading-relaxed text-muted">
                    {content.successBody}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
                  {/* Honeypot — hidden from humans, irresistible to bots. */}
                  <div
                    aria-hidden="true"
                    className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                  >
                    <label htmlFor="website">Website</label>
                    <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  <TextField
                    label="Full name"
                    name="name"
                    required
                    autoComplete="name"
                    error={errors.name}
                  />
                  <TextField
                    label="Phone number"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    defaultValue="+971 "
                    error={errors.phone}
                  />
                  <TextField
                    label="Email address"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    error={errors.email}
                  />

                  {formError && (
                    <p
                      role="alert"
                      className="rounded-[var(--radius-sm)] bg-rose-500/10 px-4 py-3 font-sans text-sm text-rose-600"
                    >
                      {formError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="mt-1 w-full"
                    disabled={status === 'submitting'}
                  >
                    {status === 'submitting' ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Sending…
                      </span>
                    ) : (
                      content.submitLabel
                    )}
                  </Button>

                  {/*
                    Inline consent replaces the tick-box. The client asked for a
                    three-field form; this keeps a consent statement on record
                    without adding a required control. Worth a legal check —
                    see docs/section-review.md §13.
                  */}
                  <p className="text-center font-sans text-xs leading-relaxed text-muted">
                    {content.consentNote}
                  </p>
                </form>
              )}
              </div>
            </div>
          </Reveal>
        </div>
        </div>
      </div>
    </section>
  );
}
