'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Phone, Clock, MessageCircle } from 'lucide-react';
import type { ClinicMapContent } from '@/content/types';
import { site, telUrl, whatsappUrl } from '@/content/site';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Keyless Google Maps embed — no API key, no billing account, works on deploy.
 *
 * Mounted only once scrolled near, so it costs nothing above the fold. If the
 * iframe is blocked (strict privacy extensions, some corporate networks) the
 * section falls back to a branded card with the same Get Directions link
 * rather than showing an empty grey box.
 */
export function ClinicMap(content: ClinicMapContent) {
  const [shouldMount, setShouldMount] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  // matchMedia rather than a hook from an animation library — this was the
  // only thing keeping that dependency in this file.
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMount(true);
          io.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Coordinates pin the clinic exactly, so the embed no longer depends on the
  // (still unsupplied) street address.
  const { lat, lng } = site.clinic.coordinates;
  const embedSrc = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  const addressLine = site.clinic.address
    ? [site.clinic.address, site.clinic.area, site.clinic.city, site.clinic.country]
        .filter(Boolean)
        .join(', ')
    : `${site.clinic.city}, ${site.clinic.country}`;

  return (
    <section id="location" className="section-y relative bg-cream">
      <div className="container-page">
        <SectionHeading
          eyebrow={content.eyebrow}
          heading={content.heading}
          lead={content.lead}
          align="center"
          className="mx-auto max-w-2xl"
        />

        <Reveal className="mt-14">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
            {/* Map */}
            <div ref={sentinel} className="relative">
              <div className="relative aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-gold-400/40 bg-blush-100 shadow-[var(--shadow-card)] lg:aspect-4/3">
                {shouldMount && !failed ? (
                  <iframe
                    src={embedSrc}
                    title={`Map showing ${site.clinic.name} in ${site.clinic.city}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    onError={() => setFailed(true)}
                    className="absolute inset-0 h-full w-full border-0 [filter:saturate(0.85)_contrast(1.02)]"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[image:var(--gradient-fill)]">
                    <MapPin className="h-9 w-9 text-white" aria-hidden="true" />
                    <p className="px-6 text-center font-display text-xl font-semibold text-white">
                      {site.clinic.name}
                    </p>
                    <p className="font-sans text-sm text-white/85">{addressLine}</p>
                  </div>
                )}

                {/* Blush vignette so the raw Google grey melts into the page. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 [background:radial-gradient(closest-side,transparent_58%,rgba(253,238,243,0.6))]"
                />

                {/* Pulsing pin */}
                {shouldMount && !failed && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
                  >
                    {!reduced && (
                      <>
                        <span
                          className="absolute inset-0 rounded-full bg-rose-500/50"
                          style={{ animation: 'pin-pulse 2.4s var(--ease-out-soft) infinite' }}
                        />
                        <span
                          className="absolute inset-0 rounded-full bg-rose-500/40"
                          style={{
                            animation: 'pin-pulse 2.4s var(--ease-out-soft) 1.2s infinite',
                          }}
                        />
                      </>
                    )}
                    <span className="absolute inset-0 rounded-full border-2 border-white bg-[image:var(--gradient-brand)] shadow-[var(--shadow-sm)]" />
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center gap-6 rounded-[var(--radius-lg)] border border-blush-200 bg-white p-8 shadow-[var(--shadow-sm)]">
              <div>
                <h3 className="font-display text-2xl font-semibold text-plum-800">
                  {site.clinic.name}
                </h3>
                <p className="mt-2 flex items-start gap-2.5 font-sans text-[0.9375rem] leading-relaxed text-muted">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  {addressLine}
                </p>
              </div>

              <div className="h-px bg-blush-200" />

              <div className="flex flex-col gap-3.5">
                <a
                  href={telUrl}
                  className="flex items-center gap-3 font-sans text-[0.9375rem] text-plum-800 transition-colors hover:text-rose-600"
                >
                  <Phone className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  {site.contact.phoneDisplay}
                </a>

                <a
                  href={whatsappUrl('Hi, could you share the clinic location details?')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-sans text-[0.9375rem] text-plum-800 transition-colors hover:text-rose-600"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  Message us on WhatsApp
                </a>

                <p className="flex items-center gap-3 font-sans text-[0.9375rem] text-muted">
                  <Clock className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  {site.clinic.hours ?? 'By appointment — please call to arrange'}
                </p>
              </div>

              <ButtonLink
                href={site.clinic.directionsUrl}
                size="md"
                className="mt-2 w-full"
                external
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Get Directions
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
