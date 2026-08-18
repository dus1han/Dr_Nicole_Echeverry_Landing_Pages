import type { LandingPageContent } from '@/content/types';
import { site, pageTitle } from '@/content/site';
import { ORIGIN } from '@/lib/site-url';

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

  const physician = {
    '@type': 'Physician',
    '@id': `${ORIGIN}/#physician`,
    name: site.doctor.name,
    medicalSpecialty: 'PlasticSurgery',
    description: content.doctor.bio,
    telephone: site.contact.phoneRaw,
    email: site.contact.email,
    url: ORIGIN,
    sameAs: [site.social.instagram, site.social.facebook],
    address: {
      '@type': 'PostalAddress',
      // Street address is omitted until confirmed — a wrong address in
      // structured data misdirects patients. See docs/open-questions.md.
      ...(site.clinic.address ? { streetAddress: site.clinic.address } : {}),
      ...(site.clinic.area ? { addressLocality: site.clinic.area } : {}),
      addressRegion: site.clinic.city,
      addressCountry: 'AE',
    },
    worksFor: {
      '@type': 'MedicalBusiness',
      name: site.clinic.name,
      address: {
        '@type': 'PostalAddress',
        addressRegion: site.clinic.city,
        addressCountry: 'AE',
      },
    },
  };

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
    performer: { '@id': `${ORIGIN}/#physician` },
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
    isPartOf: { '@type': 'WebSite', url: ORIGIN, name: site.doctor.name },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [webPage, physician, procedure, faq],
  };
}
