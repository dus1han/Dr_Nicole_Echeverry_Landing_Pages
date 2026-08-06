import type { SiteConfig } from './types';

/**
 * Clinic-wide details, shared by every landing page.
 *
 * Change the phone number here and it changes everywhere — nav, footer, every
 * WhatsApp deep link, the map card, and the structured data.
 */
export const site: SiteConfig = {
  doctor: {
    // Logo spelling, confirmed by the client and corroborated by her own
    // website, Doctify and RealSelf. Note this differs from the source
    // document ("Cheverry") — see docs/open-questions.md.
    name: 'Dr. Nicole Echeverry',
    shortName: 'Dr. Nicole',
    credentials: 'Plastic, Aesthetic & Reconstructive Surgeon',
  },

  clinic: {
    name: 'Kasaesthetic Clinic',
    // Street address still not supplied. The map no longer needs it — the exact
    // coordinates below pin the clinic precisely — but it is still wanted for
    // the MedicalBusiness structured data.
    address: null,
    area: null,
    city: 'Dubai',
    country: 'United Arab Emirates',
    /** Exact clinic position, supplied by the client. */
    coordinates: { lat: 25.13966512152247, lng: 55.20361384037153 },
    directionsUrl:
      'https://www.google.com/maps/dir/?api=1&destination=25.13966512152247,55.20361384037153',
    // TODO: needs client confirmation.
    hours: null,
  },

  contact: {
    phoneDisplay: '+971 55 557 3563',
    phoneRaw: '+971555573563',
    whatsappNumber: '971555573563',
    // Kept byte-for-byte as supplied. The domain spells the surname without
    // the leading "E" — respelling it would bounce real enquiry emails.
    email: 'info@dranicolecheverry.com',
  },

  social: {
    // Live URLs — never respelled.
    facebook: 'https://www.facebook.com/dranicolecheverry',
    instagram: 'https://www.instagram.com/dra.nicolecheverry_surgery',
  },

  legal: {
    /*
     * RETAINED BUT NOT RENDERED. The client asked for the medical disclaimer to
     * be removed from the footer. Kept here so it can be reinstated with one
     * line in Footer.tsx if their legal review calls for it — DHA health
     * advertising guidance generally expects a results-vary / not-medical-advice
     * notice on a surgical page.
     */
    disclaimer:
      'The information on this page is for general education and is not medical advice. All surgical procedures carry risks and individual results vary. A personal consultation and assessment are required before any treatment plan is confirmed.',
    copyright: `© ${new Date().getFullYear()} Dr. Nicole Echeverry | Designed and Developed by HolistiQ Digital`,
  },

  analytics: {
    // Dr. Nicole's own container. Supplied by the client, 3 Aug 2026.
    gtmId: 'GTM-WF7NSMXG',
  },

  landingPages: [
    { slug: 'mommy-makeover', title: 'Mommy Makeover', live: true },
    { slug: 'breast-lift', title: 'Breast Lift & Augmentation', live: true },
  ],
};

/** Pre-filled WhatsApp deep link. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const telUrl = `tel:${site.contact.phoneRaw}`;
export const mailUrl = `mailto:${site.contact.email}`;
