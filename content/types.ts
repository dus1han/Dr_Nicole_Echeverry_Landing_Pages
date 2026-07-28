/**
 * The contract every landing page implements.
 *
 * Components never hard-code copy — they take it as props from one of these
 * objects. That means landing page #2 is a content file plus a route, and
 * TypeScript refuses to compile a page with a missing headline or broken CTA.
 *
 * See docs/adding-a-landing-page.md
 */

export type Cta = {
  label: string;
  href: string;
};

export type ImageAsset = {
  src: string;
  alt: string;
};

/**
 * Marks a content block as containing dummy data.
 *
 * `true` triggers: a SAMPLE ribbon on every card, a grouped console warning in
 * development, exclusion from structured data, and a hard failure in
 * `npm run check:content` (which is wired into `prebuild`). Shipping dummy
 * content therefore takes a deliberate override, not an oversight.
 */
export type Placeholderable = {
  isPlaceholder?: boolean;
};

/* ------------------------------------------------------------------ */
/* Clinic-wide (content/site.ts) — shared by every landing page.       */
/* ------------------------------------------------------------------ */

export type SiteConfig = {
  doctor: {
    /** Display name. Uses the logo spelling — see docs/open-questions.md. */
    name: string;
    shortName: string;
    credentials: string;
  };
  clinic: {
    name: string;
    /** Street address. Intentionally empty until confirmed — never guessed. */
    address: string | null;
    area: string | null;
    city: string;
    country: string;
    /** Exact position — drives the keyless map embed and the directions link. */
    coordinates: { lat: number; lng: number };
    directionsUrl: string;
    hours: string | null;
  };
  contact: {
    phoneDisplay: string;
    /** E.164, for tel: and wa.me links. */
    phoneRaw: string;
    whatsappNumber: string;
    email: string;
  };
  social: {
    facebook: string;
    instagram: string;
  };
  legal: {
    disclaimer: string;
    copyright: string;
  };
  /** Every landing page in the project. Drives the footer list and sitemap. */
  landingPages: Array<{ slug: string; title: string; live: boolean }>;
};

/* ------------------------------------------------------------------ */
/* Section content                                                     */
/* ------------------------------------------------------------------ */

export type HeroContent = {
  headline: {
    /** Small lead-in above the focal line. */
    leadIn: string;
    /**
     * The focal phrase — set large and gradient-clipped, and the single
     * biggest thing on the page. This is what the visitor should read first,
     * so it carries the treatment name and the city.
     */
    focus: string;
  };
  attribution: string;
  subheadline: string;
  image: ImageAsset;
  primaryCta: Cta;
  secondaryCta: Cta;
};

export type TrustStat = {
  value: number;
  /** Rendered after the counted value, e.g. "+" or "%". */
  suffix?: string;
  prefix?: string;
  label: string;
};

export type TrustStripContent = Placeholderable & {
  stats: TrustStat[];
};

export type WhatIsItContent = {
  eyebrow: string;
  heading: string;
  body: string;
  leadIn: string;
  /** Each chip scroll-links to its card in the procedures section. */
  chips: Array<{ label: string; href: string }>;
  image: ImageAsset;
  imageCaption: string;
};

export type Procedure = {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  image: ImageAsset;
};

export type ProceduresContent = {
  eyebrow: string;
  heading: string;
  items: Procedure[];
  footerNote: string;
  cta: Cta;
};

export type CandidacyContent = {
  eyebrow: string;
  heading: string;
  body: string;
  leadIn: string;
  criteria: string[];
  closing: string;
  cta: Cta;
  image: ImageAsset;
};

export type DoctorContent = {
  eyebrow: string;
  heading: string;
  role: string;
  /** Single line lifted from the bio and set as a pull-quote. */
  pullQuote: string;
  bio: string;
  image: ImageAsset;
  cta: Cta;
};

export type WhyTrustContent = {
  eyebrow: string;
  heading: string;
  /**
   * The four pillars carry the whole section. The client's source paragraph is
   * distributed across them sentence by sentence, so there is no separate lead
   * — rendering both meant the visitor read the same words twice in a row.
   */
  pillars: Array<{ icon: PillarIcon; title: string; description: string }>;
};

export type PillarIcon = 'artistry' | 'personalised' | 'harmony' | 'care';

export type ResultCase = {
  id: string;
  caption: string;
  detail: string;
  before: ImageAsset;
  after: ImageAsset;
};

export type ResultsContent = Placeholderable & {
  eyebrow: string;
  heading: string;
  lead: string;
  cases: ResultCase[];
  disclaimer: string;
  cta: Cta;
};

export type JourneyContent = {
  eyebrow: string;
  heading: string;
  lead: string;
  steps: Array<{ title: string; description: string }>;
};

export type Review = {
  quote: string;
  name: string;
  descriptor: string;
  rating: number;
};

export type ReviewsContent = Placeholderable & {
  eyebrow: string;
  heading: string;
  items: Review[];
};

export type FaqContent = {
  eyebrow: string;
  heading: string;
  items: Array<{ question: string; answer: string }>;
  footerNote: string;
  footerCta: Cta;
};

/**
 * The closing statement. Deliberately has no CTA of its own — the booking form
 * follows immediately below, and the sticky nav and mobile bar carry a Book
 * button throughout the page.
 */
export type ClosingCtaContent = {
  heading: string;
  paragraphs: string[];
};

export type BookingContent = {
  eyebrow: string;
  heading: string;
  lead: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
  /** Inline consent line shown beneath the submit button. */
  consentNote: string;
  privacyNote: string;
  /** Short reassurance points shown beside the form on desktop. */
  assurances: string[];
};

export type ClinicMapContent = {
  eyebrow: string;
  heading: string;
  lead: string;
};

/* ------------------------------------------------------------------ */
/* The page                                                            */
/* ------------------------------------------------------------------ */

export type LandingPageContent = {
  slug: string;
  meta: {
    title: string;
    description: string;
    /** Used by the generated OpenGraph card. */
    ogHeadline: string;
  };
  /** Anchor links shown in the sticky navigation for this page. */
  nav: Array<{ label: string; href: string }>;
  announcements: string[];

  hero: HeroContent;
  trust: TrustStripContent;
  whatIsIt: WhatIsItContent;
  procedures: ProceduresContent;
  candidacy: CandidacyContent;
  doctor: DoctorContent;
  whyTrust: WhyTrustContent;
  results: ResultsContent;
  journey: JourneyContent;
  reviews: ReviewsContent;
  faq: FaqContent;
  /**
   * Optional. The closing statement section was removed from /mommy-makeover;
   * the `ConfidenceCta` component and its type are kept for pages that want it.
   * Supply this and render <ConfidenceCta {...content.closingCta} />.
   */
  closingCta?: ClosingCtaContent;
  booking: BookingContent;
  /**
   * Optional. The "Visit the Clinic" map section was removed from
   * /mommy-makeover; the `ClinicMap` component and this type are retained for
   * pages that want it. Supply this and render <ClinicMap {...content.map} />.
   */
  map?: ClinicMapContent;
};
