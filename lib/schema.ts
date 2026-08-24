import type { LandingPageContent } from '@/content/types';
import { site, pageTitle } from '@/content/site';
import { doctorCredentials } from '@/content/shared';
import { ORIGIN } from '@/lib/site-url';

/**
 * Stable @id values for the entities this site describes.
 *
 * Every page emits the same three nodes, and a node repeated across pages under
 * one @id is understood as one thing. Repeated with no @id — which is what the
 * two landing pages and the index were doing separately — reads as several
 * unrelated surgeons who happen to share a name.
 */
export const ID = {
  doctor: `${ORIGIN}/#doctor`,
  physician: `${ORIGIN}/#physician`,
  clinic: `${ORIGIN}/#clinic`,
  website: `${ORIGIN}/#website`,
} as const;

const clinicAddress = {
  '@type': 'PostalAddress',
  // Street address is omitted until confirmed — a wrong address in structured
  // data misdirects patients. See docs/open-questions.md.
  ...(site.clinic.address ? { streetAddress: site.clinic.address } : {}),
  ...(site.clinic.area ? { addressLocality: site.clinic.area } : {}),
  addressRegion: site.clinic.city,
  addressCountry: 'AE',
} as const;

/**
 * The surgeon, as a PERSON.
 *
 * `Physician` looks like the obvious type for a doctor and is not: in
 * schema.org it descends from `MedicalBusiness`, so it models a practice. A
 * name search is a query about a human being, and until this node existed the
 * site described a clinic and no person at all — which is the entity Google
 * needs in order to associate this site with her name.
 *
 * The affiliations are the substantiation. Anyone can assert a name; a name
 * tied to two named universities, four named societies and five independent
 * profiles is a claim that can be cross-checked, which is what search engines
 * actually weigh.
 */
export function doctorEntity() {
  return {
    '@type': 'Person',
    '@id': ID.doctor,
    name: site.doctor.name,
    alternateName: site.doctor.alternateNames,
    jobTitle: site.doctor.credentials,
    description: `${site.doctor.credentials} practising at ${site.clinic.name} in ${site.clinic.city}.`,
    image: `${ORIGIN}${site.doctor.portrait}`,
    url: ORIGIN,
    telephone: site.contact.phoneRaw,
    email: site.contact.email,
    sameAs: site.doctor.profiles,
    worksFor: { '@id': ID.clinic },
    alumniOf: doctorCredentials.items
      .filter((mark) => mark.kind === 'university')
      .map((mark) => ({ '@type': 'CollegeOrUniversity', name: mark.name })),
    memberOf: doctorCredentials.items
      .filter((mark) => mark.kind === 'society')
      .map((mark) => ({ '@type': 'Organization', name: mark.name })),
    knowsAbout: site.landingPages.filter((page) => page.live).map((page) => page.title),
  };
}

/** The practice she works at, as a place a patient can be treated. */
export function clinicEntity() {
  return {
    '@type': 'MedicalBusiness',
    '@id': ID.clinic,
    name: site.clinic.name,
    address: clinicAddress,
    telephone: site.contact.phoneRaw,
    ...(site.clinic.coordinates
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: site.clinic.coordinates.lat,
            longitude: site.clinic.coordinates.lng,
          },
        }
      : {}),
    employee: { '@id': ID.doctor },
  };
}

/**
 * Her practice as a medical provider — the node procedures are performed by.
 *
 * Kept alongside the Person rather than replaced by it: `MedicalProcedure`
 * wants a provider, and the two landing pages already reference this @id.
 */
export function physicianEntity(description: string) {
  return {
    '@type': 'Physician',
    '@id': ID.physician,
    name: site.doctor.name,
    medicalSpecialty: 'PlasticSurgery',
    description,
    telephone: site.contact.phoneRaw,
    email: site.contact.email,
    url: ORIGIN,
    sameAs: site.doctor.profiles,
    address: clinicAddress,
    founder: { '@id': ID.doctor },
    employee: { '@id': ID.doctor },
    parentOrganization: { '@id': ID.clinic },
  };
}

/**
 * JSON-LD for a landing page.
 *
 * Note what is deliberately absent: `Review` and `AggregateRating`. While a
 * page's reviews are flagged `isPlaceholder`, they are excluded — publishing
 * invented ratings to Google is a search-penalty and advertising-compliance
 * risk that an on-page "SAMPLE" ribbon does not cover.
 */
export function buildJsonLd(content: LandingPageContent) {
  const url = `${ORIGIN}/${content.slug}`;

  const physician = physicianEntity(content.doctor.bio);

  /*
   * Named from the page, not from the first page that happened to exist.
   *
   * This was the literal 'Mommy Makeover' with that procedure's body locations,
   * so /breast-lift handed Google structured data describing an abdomen, waist,
   * hips and thighs operation while every visible word on it was about breasts.
   * Structured data that contradicts the page is worse than none — it is the
   * machine-readable summary, and it was telling Google the page was about
   * something else.
   */
  const procedure = {
    '@type': 'MedicalProcedure',
    name: pageTitle(content.slug),
    description: content.whatIsIt.body,
    bodyLocation: content.procedureBodyLocation,
    procedureType: 'https://schema.org/SurgicalProcedure',
    performer: { '@id': ID.physician },
  };

  const faq = {
    '@type': 'FAQPage',
    mainEntity: content.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const webPage = {
    '@type': 'WebPage',
    '@id': url,
    url,
    name: content.meta.title,
    description: content.meta.description,
    inLanguage: 'en',
    isPartOf: { '@id': ID.website },
    about: { '@id': ID.doctor },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': ID.website, url: ORIGIN, name: site.doctor.name, inLanguage: 'en' },
      webPage,
      doctorEntity(),
      clinicEntity(),
      physician,
      procedure,
      faq,
    ],
  };
}
