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
  analytics: {
    /**
     * Google Tag Manager container, e.g. `GTM-XXXXXXX`.
     *
     * Lives in the CLIENT's content file, not in `components/analytics/Gtm.tsx`
     * — a project derived from this one replaces its content and would
     * otherwise silently keep loading this clinic's container and mixing its
     * traffic into their reports.
     *
     * Safe to commit: it is a public loader ID, visible in the page source of
     * every site that uses GTM. Google Ads conversion IDs and labels are a
     * different matter and stay inside GTM, so a new pixel never needs a deploy.
     *
     * `NEXT_PUBLIC_GTM_ID` overrides this when set, which is how a staging
     * build can point at a different container.
     */
    gtmId: string;
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
  cta: Cta;
};

export type CandidacyContent = {
  eyebrow: string;
  heading: string;
  body: string;
  leadIn: string;
  criteria: string[];
  cta: Cta;
  image: ImageAsset;
};

/** A training institution or professional body, shown as a logo. */
export type CredentialMark = {
  /** Full name — used as the alt text and the tooltip, never rendered as copy. */
  name: string;
  src: string;
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
  /** Optional logo ribbon beneath the section. Omit it and nothing renders. */
  credentials?: {
    label: string;
    items: CredentialMark[];
  };
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
  /**
   * A single composite: before on the left, after on the right. The clinic
   * supplies them already paired and watermarked, and they are shown whole —
   * see the note in scripts/prepare-assets.mjs for why they are not split.
   */
  image: ImageAsset;
  /**
   * Optional until the clinic supplies per-case detail. Inventing a procedure
   * or a recovery time under a real patient's photograph is not a placeholder,
   * it is a false claim, so these render only when present.
   */
  caption?: string;
  detail?: string;
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
  /** Headline the patient gave the review, where they gave one. */
  title?: string;
  /** Context such as "Mother of two · Dubai", where it is known. */
  descriptor?: string;
  /**
   * Optional, and omitted rather than assumed. A star rating the patient did
   * not actually give is a fabricated claim about a real person — the fact that
   * five stars is the likely answer is not a reason to publish it.
   */
  rating?: number;
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
  heading: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
  /** Inline consent line shown beneath the submit button. */
  consentNote: string;
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
