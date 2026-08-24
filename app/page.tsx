import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Phone } from 'lucide-react';
import { site, telUrl } from '@/content/site';
import { doctorCredentials, sharedTrust } from '@/content/shared';
import { ORIGIN } from '@/lib/site-url';
import { ID, doctorEntity, clinicEntity, physicianEntity } from '@/lib/schema';
import { AuroraBackground } from '@/components/effects/AuroraBackground';

/**
 * A one-line description of each treatment page, for the index only.
 *
 * Deliberately not lifted from each page's meta description: that copy is
 * written to win a click in a search result for that page, and repeating it
 * here would put the same sentence on two indexed URLs.
 */
const SUMMARIES: Record<string, string> = {
  'mommy-makeover':
    'A personalised combination of tummy tuck, breast surgery and liposuction to restore the contours changed by pregnancy and breastfeeding.',
  'breast-lift':
    'Lift, augmentation, the two combined, or reduction — shaped to your proportions rather than to a size.',
};

/** The years figure, read from the shared trust stats rather than restated. */
const yearsStat = sharedTrust.stats.find((stat) => 'value' in stat);
const years = yearsStat && 'value' in yearsStat ? `${yearsStat.value}${yearsStat.suffix ?? ''} ` : '';

export const metadata: Metadata = {
  title: `${site.doctor.name} | Plastic Surgeon in ${site.clinic.city}`,
  description: `${site.doctor.credentials} in ${site.clinic.city}. Colombian-trained, double board certified, with ${years}years of surgical experience. Private consultations at ${site.clinic.name}.`,
  alternates: { canonical: '/' },
};

/**
 * The index — the hub every other page links back to.
 *
 * It was a bare list of links with 29 words on it. That is enough for a person
 * who already knows where they are going, and nothing at all for a search
 * engine: the one page that links to everything else said almost nothing about
 * who this is or where she practises, so it could not rank for her name and
 * passed no context to the pages beneath it.
 *
 * It stays a directory rather than becoming a third landing page. The campaign
 * pages must keep their own queries — an index competing with them for
 * "mommy makeover in Dubai" would split the site against itself.
 */
export default function Home() {
  /*
   * The index is where the site says who she is, so it carries the fullest
   * version of the entity: the WebSite, the person, the clinic, and the
   * practice — all under the same @id values the treatment pages use.
   *
   * `mainEntity` on the ProfilePage is the part that matters for a name query.
   * It states that this page is ABOUT her rather than merely mentioning her,
   * which is the distinction between a page that can represent the person in
   * search results and one that cannot.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': ID.website,
        url: ORIGIN,
        name: site.doctor.name,
        alternateName: site.doctor.alternateNames,
        inLanguage: 'en',
        publisher: { '@id': ID.doctor },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${ORIGIN}/#webpage`,
        url: ORIGIN,
        name: `${site.doctor.name} | Plastic Surgeon in ${site.clinic.city}`,
        isPartOf: { '@id': ID.website },
        inLanguage: 'en',
        mainEntity: { '@id': ID.doctor },
      },
      doctorEntity(),
      clinicEntity(),
      {
        ...physicianEntity(`${site.doctor.credentials} practising in ${site.clinic.city}.`),
        // The treatments she offers, tied to the pages that describe them.
        availableService: site.landingPages
          .filter((page) => page.live)
          .map((page) => ({
            '@type': 'MedicalProcedure',
            name: page.title,
            url: `${ORIGIN}/${page.slug}`,
          })),
      },
    ],
  };

  return (
    <main className="grain relative min-h-screen overflow-hidden bg-blush-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuroraBackground />

      <div className="container-page relative z-10 py-20 sm:py-24">
        <Image
          src="/logo/logo-plum.png"
          alt={site.doctor.name}
          width={800}
          height={450}
          sizes="240px"
          priority
          className="h-28 w-auto"
        />

        <h1 className="mt-10 max-w-3xl font-display text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-plum-800">
          {site.doctor.credentials} in {site.clinic.city}
        </h1>

        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-ink/80">
          <p>
            {site.doctor.name} is a Colombian-trained plastic surgeon practising at{' '}
            {site.clinic.name} in {site.clinic.city}, specialising in breast surgery, body
            contouring and post-pregnancy restoration.
          </p>
          <p>
            Every treatment plan is built around one patient&rsquo;s anatomy, lifestyle and goals
            rather than a standard technique, and every stage of the journey is guided by{' '}
            {site.doctor.shortName} and a dedicated female team.
          </p>
        </div>

        {/* The trust figures the treatment pages carry, so the hub states them too. */}
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          {sharedTrust.stats.map((stat) => (
            <li key={stat.label} className="font-sans text-sm text-plum-700">
              <span className="font-semibold text-plum-800">
                {'value' in stat ? `${stat.value}${stat.suffix ?? ''}` : stat.text}
              </span>{' '}
              {stat.label}
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-display text-2xl font-semibold text-plum-800">Treatments</h2>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:max-w-4xl">
          {site.landingPages
            .filter((page) => page.live)
            .map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/${page.slug}`}
                  className="group flex h-full flex-col gap-3 rounded-[var(--radius-md)] border border-blush-200 bg-white/80 px-6 py-5 shadow-[var(--shadow-sm)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                >
                  <span className="flex items-center justify-between gap-4">
                    <span className="font-display text-xl font-semibold text-plum-800">
                      {page.title} in {site.clinic.city}
                    </span>
                    <ArrowRight
                      className="h-5 w-5 shrink-0 text-rose-500 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                  {SUMMARIES[page.slug] && (
                    <span className="font-sans text-sm leading-relaxed text-ink/70">
                      {SUMMARIES[page.slug]}
                    </span>
                  )}
                </Link>
              </li>
            ))}
        </ul>

        {/*
          Name, address and phone in crawlable text, matching the treatment
          pages and the structured data exactly. Local search cross-checks these
          against each other and against the Business Profile.
        */}
        <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-plum-900/12 pt-8">
          <p className="flex items-center gap-2 font-sans text-sm text-ink/75">
            <MapPin className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
            {site.clinic.name}, {site.clinic.city}, {site.clinic.country}
          </p>
          <a
            href={telUrl}
            className="flex items-center gap-2 py-1 font-sans text-sm font-semibold text-plum-800 transition-colors hover:text-rose-600"
          >
            <Phone className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
            {site.contact.phoneDisplay}
          </a>
        </div>

        <p className="mt-6 font-sans text-xs uppercase tracking-[0.14em] text-muted">
          {doctorCredentials.label}:{' '}
          {doctorCredentials.items.map((mark) => mark.name).join(' · ')}
        </p>
      </div>
    </main>
  );
}
