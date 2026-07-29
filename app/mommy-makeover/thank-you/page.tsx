import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Phone, MessageCircle, ArrowLeft } from 'lucide-react';
import { site, telUrl, whatsappUrl } from '@/content/site';
import { mommyMakeover } from '@/content/mommy-makeover';
import { AuroraBackground } from '@/components/effects/AuroraBackground';
import { LeadEvent } from '@/components/analytics/LeadEvent';

/**
 * Post-submission confirmation.
 *
 * A real page rather than a modal, because a modal produces no page load and
 * therefore nothing Google Ads can hang a URL rule on. Styled as a centred
 * success card, so it reads like the popup it replaces.
 *
 * `noindex` matters: without it this page can surface in search results, and
 * strangers landing on a "thank you for your enquiry" page is both confusing
 * and — if the team ever switches to a URL-based conversion rule — a source of
 * phantom conversions.
 */
export const metadata: Metadata = {
  title: 'Thank you | Dr. Nicole Echeverry',
  description: 'Your consultation request has been received.',
  robots: { index: false, follow: false },
};

const WA_MESSAGE = "Hi, I've just requested a Mommy Makeover consultation.";

export default function ThankYouPage() {
  const { successTitle, successBody } = mommyMakeover.booking;

  return (
    <main className="grain relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(180deg,var(--color-blush-100)_0%,var(--color-blush-50)_55%,var(--color-cream)_100%)] px-6 py-16">
      <AuroraBackground />
      <LeadEvent formLocation={mommyMakeover.slug} />

      <div className="relative z-10 w-full max-w-xl text-center">
        <Link
          href={`/${mommyMakeover.slug}`}
          className="inline-block"
          aria-label={`${site.doctor.name} — back to the Mommy Makeover page`}
        >
          <Image
            src="/logo/logo-plum.png"
            alt={site.doctor.name}
            width={800}
            height={450}
            sizes="260px"
            priority
            className="mx-auto h-24 w-auto"
          />
        </Link>

        <div className="mt-10 rounded-[var(--radius-lg)] border border-blush-200 bg-white/85 p-9 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 ring-1 ring-rose-400/40">
            <Check className="h-8 w-8 text-rose-600" strokeWidth={2.4} aria-hidden="true" />
          </span>

          <h1 className="mt-6 font-display text-[clamp(2rem,5vw,2.75rem)] font-semibold leading-tight text-plum-800">
            {successTitle}
          </h1>

          <p className="mx-auto mt-4 max-w-md text-[1.0625rem] leading-relaxed text-ink/80">
            {successBody}
          </p>

          <div className="mt-8 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(174,133,68,0.4),transparent)]" />

          <p className="mt-6 font-sans text-sm text-muted">
            Prefer to speak to someone now?
          </p>

          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={telUrl}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[image:var(--gradient-fill)] px-7 font-sans text-[0.9375rem] font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {site.contact.phoneDisplay}
            </a>
            <a
              href={whatsappUrl(WA_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-plum-800/25 px-7 font-sans text-[0.9375rem] font-semibold text-plum-800 transition-colors hover:bg-plum-800 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </div>

        <Link
          href={`/${mommyMakeover.slug}`}
          className="mt-8 inline-flex items-center gap-2 py-2 font-sans text-sm font-medium text-plum-700 transition-colors hover:text-rose-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to the page
        </Link>
      </div>
    </main>
  );
}
