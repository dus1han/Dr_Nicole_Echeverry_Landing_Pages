import type { LandingPageContent } from './types';
import {
  doctorBio,
  doctorCredentials,
  doctorPullQuote,
  sharedBooking,
  sharedReviews,
  sharedTrust,
  whyTrustPillars,
} from './shared';

const IMG = '/images/breast-lift';

/** Named once so the shared blocks and the copy cannot disagree about it. */
const TREATMENT = 'Breast Lift & Augmentation';

/**
 * /breast-lift — the second landing page.
 *
 * Same sections, same components, same design system as /mommy-makeover. Only
 * the treatment content differs; the surgeon, her credentials, the trust
 * figures, the reviews and the enquiry form come from `content/shared.ts` so
 * they cannot drift between the two pages.
 *
 * Copy is from the client's "Breast Surgery - LP content.docx", 5 Aug 2026.
 * Where that document said "<Same Description>" or "<Same reviews>", the shared
 * block is used — which is what it was asking for.
 */
export const breastLift: LandingPageContent = {
  slug: 'breast-lift',

  meta: {
    title: 'Breast Lift & Augmentation in Dubai | Dr. Nicole Echeverry',
    description:
      'Restore breast shape, fullness and symmetry with a personalised Breast Lift & Augmentation in Dubai by Dr. Nicole Echeverry — world-class breast restoration inspired by Colombian artistry. Book a private consultation.',
    ogHeadline: 'Breast Lift & Augmentation in Dubai',
  },

  /** Anchors for this page's own sections. */
  nav: [
    { label: 'What Is It', href: '#what-is-it' },
    { label: 'Procedures', href: '#procedures' },
    { label: 'Dr. Nicole', href: '#meet-dr-nicole' },
    { label: 'Results', href: '#results' },
    { label: 'FAQ', href: '#faq' },
  ],

  // Clinic-wide, so the same strip runs on every page.
  announcements: [
    'Colombian Aesthetic Artistry',
    'Plastic, Aesthetic & Reconstructive Surgeon',
    'Private Consultations in Dubai',
    'Personalised Treatment Plans',
  ],

  /* ---------------------------------------------------------------- */

  hero: {
    headline: {
      leadIn: 'Restore Beautiful Shape, Fullness & Confidence',
      focus: 'Breast Lift & Augmentation in Dubai',
    },
    attribution: 'with Dr. Nicole Echeverry',
    subheadline:
      'World-class breast restoration inspired by Colombian artistry and tailored exclusively to you.',
    frames: [
      {
        src: `${IMG}/hero-1.jpg`,
        alt: 'A woman’s upper body in soft activewear, photographed in warm daylight',
      },
      {
        src: `${IMG}/hero-2.jpg`,
        alt: 'A woman standing in neutral-toned activewear against a warm backdrop',
      },
      {
        src: `${IMG}/hero-3.jpg`,
        alt: 'A woman’s silhouette in soft pink activewear against a muted background',
      },
    ],
    primaryCta: { label: 'Book Your Consultation', href: '#book' },
    secondaryCta: { label: 'See The Results', href: '#results' },
  },

  /* ---------------------------------------------------------------- */

  trust: sharedTrust,

  /* ---------------------------------------------------------------- */

  whatIsIt: {
    eyebrow: 'The Procedure',
    heading: 'What is a Breast Lift & Augmentation?',
    body: 'Pregnancy, breastfeeding, ageing, weight changes, and genetics can all influence the shape, position, and fullness of the breasts. Many women notice that their breasts no longer sit as they once did, lose upper fullness, or appear less symmetrical over time.',
    leadIn: 'Two procedures, combined into one personalised treatment:',
    chips: [
      { label: 'Breast Lift', href: '#lift' },
      { label: 'Breast Augmentation', href: '#augmentation' },
      { label: 'Combined Lift & Augmentation', href: '#combined' },
    ],
    image: {
      src: `${IMG}/what-is-it.jpg`,
      alt: 'A woman seated in soft neutral loungewear against a warm background',
    },
    imageCaption: 'Balanced, proportionate, naturally beautiful',
  },

  /* ---------------------------------------------------------------- */

  /*
   * The client's document describes one combined procedure rather than three.
   * It is split here into the two operations it names plus the combination,
   * because the section's whole job is to explain what "Lift & Augmentation"
   * actually means — and every sentence below is theirs.
   */
  procedures: {
    eyebrow: 'What It Involves',
    heading: 'Two procedures, combined around you',
    items: [
      {
        id: 'lift',
        name: 'Breast Lift',
        description:
          'A breast lift reshapes and elevates the breasts to a more youthful position, restoring shape where it has been lost to pregnancy, breastfeeding, weight change or time.',
        benefits: [
          'Restore breast position',
          'Lift breasts that have lost their natural position',
          'Improve breast symmetry',
        ],
        image: {
          src: `${IMG}/procedure-lift.jpg`,
          alt: 'A woman in neutral-toned activewear, photographed from the shoulders down',
        },
      },
      {
        id: 'augmentation',
        name: 'Breast Augmentation',
        description:
          'Augmentation restores or enhances volume using implants that complement your natural body proportions, rather than simply increasing size.',
        benefits: [
          'Restore natural fullness',
          'Enhance lost volume while keeping natural proportions',
          'Beautifully balanced proportions',
        ],
        image: {
          src: `${IMG}/procedure-augmentation.jpg`,
          alt: 'A woman in soft white lingerie against a warm neutral background',
        },
      },
      {
        id: 'combined',
        name: 'Combined Lift & Augmentation',
        description:
          'Performed together, the two create breasts that feel balanced, proportionate and naturally beautiful — one operation, one recovery, one personalised plan.',
        benefits: [
          'Feel more confident in your clothes',
          'Improved shape in dresses and swimwear',
          'Long-lasting confidence',
        ],
        image: {
          src: `${IMG}/procedure-combined.jpg`,
          alt: 'A woman standing in neutral loungewear, photographed from the shoulders down',
        },
      },
    ],
    cta: { label: 'Book Your Consultation', href: '#book' },
  },

  /* ---------------------------------------------------------------- */

  candidacy: {
    eyebrow: 'Candidacy',
    heading: 'Am I a good candidate?',
    body: 'Many women notice changes in their breasts over time, particularly after pregnancy, breastfeeding, weight loss, or the natural ageing process. If you’ve been thinking about restoring breast shape, improving fullness, or achieving better symmetry, a Breast Lift & Augmentation may be the right solution.',
    leadIn: 'You may be a suitable candidate if you:',
    criteria: [
      'Have lost breast volume after pregnancy or weight loss.',
      'Feel your breasts have begun to sag or sit lower than before.',
      'Would like fuller breasts while maintaining natural proportions.',
      'Have uneven breast size or shape.',
      'Want to improve how clothing and swimwear fit.',
    ],
    cta: { label: 'Request an Honest Assessment', href: '#book' },
    image: {
      src: `${IMG}/candidacy.jpg`,
      alt: 'A woman’s silhouette in soft neutral tones against a warm background',
    },
  },

  /* ---------------------------------------------------------------- */

  doctor: {
    eyebrow: 'Meet Your Surgeon',
    heading: 'Dr. Nicole Echeverry',
    role: 'Plastic, Aesthetic & Reconstructive Surgeon',
    pullQuote: doctorPullQuote,
    bio: doctorBio(TREATMENT),
    image: {
      // Shared with /mommy-makeover: it is the same surgeon, and duplicating
      // the file to sit under a second folder would only cost a second download
      // for visitors who see both pages.
      src: '/images/mommy-makeover/doctor-portrait.jpg',
      alt: 'Dr. Nicole Echeverry seated, wearing a white tailored suit',
    },
    cta: { label: 'Book a Consultation with Dr. Nicole', href: '#book' },
    credentials: doctorCredentials,
  },

  /* ---------------------------------------------------------------- */

  whyTrust: {
    eyebrow: 'Her Philosophy',
    // The client's own heading for this page.
    heading: 'Why Ladies Choose Dr. Nicole?',
    pillars: whyTrustPillars(TREATMENT),
  },

  /* ---------------------------------------------------------------- */

  results: {
    /*
     * Real, clinic-supplied composites — before on the left, after on the
     * right, already watermarked. Used whole and never split; see the note in
     * scripts/prepare-assets.mjs.
     *
     * `caption` and `detail` are omitted deliberately. Inventing a procedure or
     * a recovery time under a real patient's photograph is not placeholder
     * text, it is a false claim about a specific person.
     */
    isPlaceholder: false,
    eyebrow: 'Real Results',
    heading: 'Before & After',
    lead: 'Every result belongs to a real woman with a real story. Dr. Nicole shares her full gallery personally during your consultation.',
    cases: [
      {
        id: 'case-1',
        image: {
          src: `${IMG}/results/case-1.jpg`,
          alt: 'Before and after a Breast Lift & Augmentation',
        },
      },
      {
        id: 'case-2',
        image: {
          src: `${IMG}/results/case-2.jpg`,
          alt: 'Before and after a Breast Lift & Augmentation',
        },
      },
      {
        id: 'case-3',
        image: {
          src: `${IMG}/results/case-3.jpg`,
          alt: 'Before and after a Breast Lift & Augmentation',
        },
      },
    ],
    disclaimer:
      'Photographs are illustrative of typical outcomes. Individual results vary and are determined by your own anatomy.',
    cta: { label: 'See More in a Private Consultation', href: '#book' },
  },

  /* ---------------------------------------------------------------- */

  /*
   * "How is the Procedure Performed?" from the client's document, laid out as
   * the same five-step timeline the other page uses.
   */
  journey: {
    eyebrow: 'What to Expect',
    heading: 'Your journey, step by step',
    steps: [
      {
        title: 'Private Consultation',
        description:
          'Dr. Nicole evaluates your anatomy, skin quality, breast volume and aesthetic goals.',
      },
      {
        title: 'Your Personalised Plan',
        description:
          'A surgical plan built around your proportions, your goals and what is realistic for you.',
      },
      {
        title: 'Preparation',
        description:
          'Clear pre-operative guidance so you arrive confident and know exactly what happens next.',
      },
      {
        title: 'Your Surgery Day',
        description:
          'Performed under general anaesthesia, typically taking two to four hours.',
      },
      {
        title: 'Guided Recovery',
        description:
          'A supportive surgical bra, scheduled follow-ups and personalised aftercare as you heal.',
      },
    ],
  },

  /* ---------------------------------------------------------------- */

  reviews: sharedReviews,

  /* ---------------------------------------------------------------- */

  faq: {
    eyebrow: 'Questions',
    heading: 'Frequently Asked Questions',
    items: [
      {
        question: 'Will my breasts look natural?',
        answer:
          'Yes. Dr. Nicole carefully selects the implant size and surgical technique to complement your body proportions and aesthetic goals. The focus is always on achieving elegant, natural-looking results.',
      },
      {
        question: 'Will there be visible scars?',
        answer:
          'Each incision is carefully planned to achieve the best possible aesthetic outcome while placing scars as discreetly as possible.',
      },
      {
        question: 'How long does the procedure take?',
        answer:
          'Most Breast Lift & Augmentation procedures take approximately 2–4 hours, depending on your personalized treatment plan.',
      },
      {
        question: 'Will the procedure be painful?',
        answer:
          'You’ll be comfortably asleep under general anaesthesia during surgery. Mild to moderate discomfort, tightness, and swelling are expected afterward and are typically well managed with prescribed medication.',
      },
      {
        question: 'How long is the recovery?',
        answer:
          'Most patients return to light daily activities within 1–2 weeks, although healing varies from person to person. Your recovery timeline will be discussed during your consultation.',
      },
      {
        question: 'How long do breast implants last?',
        answer:
          'Modern breast implants are designed to be durable. Regular follow-up and routine monitoring help ensure your breasts remain healthy over time.',
      },
      {
        question: 'What happens after surgery?',
        answer:
          'Your recovery includes scheduled follow-up appointments, personalized aftercare guidance, and ongoing support to ensure your healing progresses smoothly.',
      },
      {
        question: 'What happens during my consultation?',
        answer:
          'Dr. Nicole will assess your anatomy, discuss your goals, explain your treatment options, and recommend a personalized surgical plan designed to achieve the most balanced and natural-looking outcome.',
      },
    ],
    footerNote: 'Still have a question?',
    footerCta: { label: 'Ask Dr. Nicole directly', href: 'whatsapp' },
  },

  /* ---------------------------------------------------------------- */

  booking: sharedBooking,
};
