import type { LandingPageContent } from '@/content/types';
import { site } from '@/content/site';
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

  const procedure = {
    '@type': 'MedicalProcedure',
    name: 'Mommy Makeover',
    description: content.whatIsIt.body,
    bodyLocation: ['Abdomen', 'Breast', 'Waist', 'Hips', 'Thighs'],
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
