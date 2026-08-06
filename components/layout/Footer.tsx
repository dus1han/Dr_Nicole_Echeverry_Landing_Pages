import Image from 'next/image';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { site, telUrl, mailUrl, whatsappUrl } from '@/content/site';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';

/**
 * Names the treatment, like every other WhatsApp entry point on the page.
 *
 * Each page is about one procedure, so a message that does not say which one
 * makes the clinic ask before it can answer — and they cannot tell which
 * campaign it came from.
 */
const waMessage = (treatment?: string) =>
  treatment
    ? `Hi, I'd like to ask about a ${treatment} consultation with ${site.doctor.shortName}.`
    : `Hi, I'd like to ask about a consultation with ${site.doctor.shortName}.`;

/**
 * Three columns: brand · contact · location.
 *
 * The Explore and Treatments link columns were removed — the page is a single
 * scroll with a sticky nav, so in-page anchors in the footer were duplicating
 * navigation the visitor already has.
 */
export function Footer({
  items,
  treatment,
}: {
  items: Array<{ label: string; href: string }>;
  treatment?: string;
}) {
  const { lat, lng } = site.clinic.coordinates;

  /*
   * Keyless embed — no API key, no billing account.
   *
   * Queried by COORDINATES, which centres the map exactly on the clinic. A
   * place-name query was tried to get Google's own labelled red pin, but
   * without the keyed Embed API it renders an off-centre marker and an
   * "Open in Maps" chip instead. The clinic name is drawn as our own branded
   * label over the map below — accurate, centred, and on-brand.
   */
  const mapSrc = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  const socials = [
    { href: site.social.instagram, Icon: Instagram, label: 'Instagram' },
    { href: site.social.facebook, Icon: Facebook, label: 'Facebook' },
    { href: whatsappUrl(waMessage(treatment)), Icon: WhatsAppIcon, label: 'WhatsApp' },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-rose-300/50 bg-[linear-gradient(180deg,var(--color-blush-100)_0%,var(--color-blush-200)_100%)] pt-[clamp(2.5rem,5vw,4rem)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-rose-300/22 blur-[120px]"
      />

      <div className="container-page relative grid gap-10 pb-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
        {/* ---------------- 1 · Brand ---------------- */}
        <div className="flex items-center justify-center lg:justify-start">
          {/*
            The logo itself does NOT move — a bobbing brand mark read as
            restless. Two breathing halos sit behind it instead, offset in
            timing and size so the glow swells softly rather than pulsing on a
            single beat. The mark stays perfectly still.
          */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="anim-glow absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgb(232_138_171/0.6),transparent)] blur-2xl"
            />
            <div
              aria-hidden="true"
              className="anim-glow absolute -inset-4 rounded-full bg-[radial-gradient(closest-side,rgb(247_203_218/0.7),transparent)] blur-xl"
              style={{ animationDelay: '2.4s', animationDuration: '8s' }}
            />
            <Image
              src="/logo/logo-plum.png"
              alt={site.doctor.name}
              width={800}
              height={450}
              sizes="520px"
              className="relative h-40 w-auto sm:h-48"
            />
          </div>
        </div>

        {/*
          ---------------- 2 · Contact ----------------
          Top-aligned with a natural gap, so "CONTACT" sits level with "FIND US".
          An earlier version used justify-between to stretch this column down to
          the map's bottom edge — that closed the height difference but opened a
          large empty void between the email address and "Connect with us",
          which looked worse than the column simply being shorter.
        */}
        <div className="flex flex-col gap-8">
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-plum-700">
              Contact
            </h3>
            <ul className="mt-5 space-y-3.5">
            <li>
              <a
                href={telUrl}
                // font-sans, not font-display: Playfair is reserved for headings
                // and pull-quotes across the site, so a serif phone number read
                // as a different brand. Size carries the emphasis instead.
                className="flex items-center gap-3 py-1 font-sans text-[1.0625rem] font-semibold text-plum-800 transition-colors hover:text-rose-600"
              >
                <Phone className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                {site.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={mailUrl}
                className="flex items-center gap-3 py-1 font-sans text-sm break-all text-ink/80 transition-colors hover:text-plum-700"
              >
                <Mail className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                {site.contact.email}
              </a>
            </li>
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-plum-700">
              Connect with us
            </h3>
            <div className="mt-4 flex gap-3">
              {socials.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-blush-200 bg-white/70 text-plum-700 transition-all duration-300 hover:scale-110 hover:border-transparent hover:bg-[image:var(--gradient-fill)] hover:text-white"
              >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- 3 · Location ---------------- */}
        <div className="md:col-span-2 lg:col-span-1">
          <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-plum-700">
            Visit the Clinic
          </h3>

          {/*
            The whole card is a link that opens Google Maps.
            - The iframe is pointer-events-none so the overlay link receives the
              click rather than the map panning under the cursor.
            - Only ONE marker is shown: Google's own, which the embed always
              drops at the centre. An earlier version added a custom dot too,
              which read as two separate indicators.
            - The label sits just above that marker, offset enough to clear it.
          */}
          <a
            href={site.clinic.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${site.clinic.name} in Google Maps`}
            className="group relative mt-5 block overflow-hidden rounded-[var(--radius-md)] border border-gold-500/35 shadow-[var(--shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)]"
          >
            <div className="relative aspect-16/10">
              <iframe
                src={mapSrc}
                title={`Map showing ${site.clinic.name} in ${site.clinic.city}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                tabIndex={-1}
                className="pointer-events-none absolute inset-0 h-full w-full border-0"
              />
            </div>

            <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(100%+0.75rem)]">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-pill)] bg-white px-3 py-1.5 shadow-[var(--shadow-card)] transition-transform duration-300 group-hover:scale-105">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden="true" />
                <span className="font-sans text-xs font-semibold text-plum-800">
                  {site.clinic.name}
                </span>
              </span>
            </span>
          </a>
        </div>
      </div>

      {/*
        The medical disclaimer was removed at the client's request. The text is
        retained in content/site.ts (`legal.disclaimer`) so it can be reinstated
        in one line — see the note in docs/section-review.md §15.
      */}
      <div className="container-page relative py-6">
        {/* Gold hairline separator, matching the dividers used across the page. */}
        <span
          aria-hidden="true"
          className="mb-6 block h-px w-full bg-[linear-gradient(90deg,transparent,rgba(174,133,68,0.45),transparent)]"
        />
        <p className="text-center font-sans text-xs text-muted">{site.legal.copyright}</p>
      </div>
    </footer>
  );
}
