import Link from 'next/link';
import type { Metadata } from 'next';
import { site, telUrl } from '@/content/site';
import { AuroraBackground } from '@/components/effects/AuroraBackground';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  const primary = site.landingPages.find((page) => page.live);

  return (
    <main className="grain relative grid min-h-screen place-items-center overflow-hidden bg-blush-50 px-6 py-20 text-center">
      <AuroraBackground />

      <div className="relative z-10">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">
          Page not found
        </p>

        <h1 className="mt-5 font-display text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[1.06] text-plum-800">
          This page doesn’t exist
        </h1>

        <p className="mx-auto mt-5 max-w-[46ch] leading-relaxed text-muted">
          The link may be out of date. You can head back to the main page, or speak to the
          clinic directly.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {primary && (
            <Link
              href={`/${primary.slug}`}
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-pill)] bg-[image:var(--gradient-fill)] px-8 font-sans text-[0.9375rem] font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              {primary.title}
            </Link>
          )}
          <a
            href={telUrl}
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-pill)] border border-plum-800/25 px-8 font-sans text-[0.9375rem] font-semibold text-plum-800 transition-colors hover:bg-plum-800 hover:text-white"
          >
            Call the clinic
          </a>
        </div>

        <p className="mt-10 font-sans text-xs text-muted">
          {site.doctor.name} · {site.clinic.city}
        </p>
      </div>
    </main>
  );
}
