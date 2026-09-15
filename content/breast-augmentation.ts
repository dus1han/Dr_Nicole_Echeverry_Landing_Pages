import type { LandingPageContent } from './types';
import {
  doctorBio,
  doctorCredentials,
  doctorPullQuote,
  sharedBooking,
  sharedReviews,
  femaleLedTrust,
  whyTrustPillars,
} from './shared';

/**
 * Photography is /breast-lift's, by path rather than by copy.
 *
 * The client's brief for this page is "all images and structure same as the
 * breast-lift", and the two pages are about the same anatomy shot in the same
 * session. Duplicating fifteen files under a second folder would cost a second
 * download for anyone who sees both pages and would let the two sets drift the
 * first time one of them is re-cut. Same reasoning as the shared doctor
 * portrait below.
 */
const IMG = '/images/breast-lift';

/*
 * The one exception to the sharing described above. This page's procedure card
 * now carries its own photograph, so it lives in its own folder — writing it
 * into /images/breast-lift would have silently re-cut the augmentation card on
 * /breast-lift, which still wants the original.
 */
const OWN_IMG = '/images/breast-augmentation';

/** Named once so the shared blocks and the copy cannot disagree about it. */
const TREATMENT = 'Breast Augmentation';

/**
 * /breast-augmentation — the third landing page.
 *
 * Same sections, same components, same design system as /breast-lift, which is
 * what the brief asked for. The surgeon, her credentials, the reviews and the
 * enquiry form come from `content/shared.ts` so they cannot drift between the
 * three pages.
 *
 * Copy is from the client's "changes.docx" (Breast folder), 27 Aug 2026. That
 * document is a DELTA against /breast-lift: it gives new copy for the title,
 * hero, "What is…", "What it involves" and the FAQ, and marks candidacy, the
 * surgeon, her philosophy, the gallery, the journey and the reviews as "same
 * section". Those are taken from /breast-lift verbatim, with one exception
 * noted at `candidacy` below.
 */
export const breastAugmentation: LandingPageContent = {
  slug: 'breast-augmentation',

  meta: {
    title: 'Breast Augmentation in Dubai | Dr. Nicole Echeverry',
    /*
     * Not supplied by the client. Written from their own hero and "What is…"
     * copy so it says the same thing the page says, and deliberately different
     * from /breast-lift's — two indexed URLs sharing a description compete with
     * each other for the same result.
     */
    description:
      'Personalised breast augmentation in Dubai with Dr. Nicole Echeverry — implant size, placement and incision planned around your anatomy, proportions and aesthetic goals rather than a standard size. Book a private consultation.',
    ogHeadline: 'Breast Augmentation in Dubai',
    ogSubline: 'Restore Beautiful Shape, Fullness & Confidence',
  },

  procedureBodyLocation: ['Breast'],

  /**
   * Anchors for this page's own sections.
   *
   * "What It Involves" rather than /breast-lift's "Procedures": this page has
   * one operation, and a plural label above a single card is the kind of small
   * inaccuracy a visitor notices without being able to say why. It is also the
   * section's own eyebrow, so the nav and the heading agree.
   */
  nav: [
    { label: 'What Is It', href: '#what-is-it' },
    { label: 'What It Involves', href: '#procedures' },
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
      focus: 'Breast Augmentation in Dubai',
    },
    attribution: 'with Dr. Nicole Echeverry',
    /*
     * The client's subheading, verbatim.
     *
     * Note it names the surgeon again, one line below the attribution above —
     * their document put her in the subheading because it had no separate
     * attribution line. Left as written rather than trimmed, because it is
     * their copy; dropping "with Dr. Nicole Echeverry, " from the front is the
     * one-line fix if they would rather not read her name twice.
     */
    subheadline:
      'Personalised breast augmentation with Dr. Nicole Echeverry, designed around your anatomy, proportions and aesthetic goals.',
    // "//use same slider" — the same three frames as /breast-lift.
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

  /*
   * "100% Female-Led Team" in place of "Zero scars on body" (changes.docx,
   * 27 Aug 2026). Shared with /breast-lift, which was given the same change
   * straight afterwards — see `femaleLedTrust` in content/shared.ts.
   *
   * /mommy-makeover still shows "Zero scars on body". Two of the three pages
   * now disagree with the third, which is worth putting back to the client:
   * docs/open-questions.md had already flagged that figure as a claim that
   * reads oddly on a surgical page.
   */
  trust: femaleLedTrust,

  /* ---------------------------------------------------------------- */

  whatIsIt: {
    eyebrow: 'The Procedure',
    heading: 'What is Breast Augmentation?',
    body: 'Breast augmentation enhances or restores breast volume using carefully selected implants to create a shape that complements your natural body proportions. Rather than focusing simply on size, Dr. Nicole considers your existing breast tissue, chest proportions, symmetry, desired fullness and overall body shape.',
    /*
     * Statements, not links — see the note on `chips` in content/types.ts.
     * /breast-lift's four chips each jump to one of its four procedure cards;
     * this page has one card, so the client's four lines say what the operation
     * achieves instead and carry no href.
     */
    chips: [
      { label: 'Restore fullness lost after pregnancy, breastfeeding or weight changes' },
      { label: 'Enhance breast volume, shape and projection' },
      { label: 'Improve symmetry between the breasts' },
      { label: 'Create fuller, balanced proportions' },
    ],
    image: {
      src: `${IMG}/what-is-it.jpg`,
      alt: 'A woman seated in soft neutral loungewear against a warm background',
    },
    imageCaption: 'Balanced, proportionate, naturally beautiful',
  },

  /* ---------------------------------------------------------------- */

  /*
   * One card, because the client's document describes one operation.
   *
   * `benefits` is absent rather than empty: their copy for this card is the
   * paragraph and nothing else, and three invented bullet points under a
   * surgical description would be a claim nobody made. The section renders a
   * single centred card at a text measure — see the note in Procedures.tsx.
   */
  procedures: {
    eyebrow: 'What It Involves',
    heading: 'Breast Augmentation, Personalised to You',
    items: [
      {
        id: 'augmentation',
        // No `name`: the section heading two lines above already says
        // "Breast Augmentation, Personalised to You".
        description:
          'Breast augmentation is highly individual. Implant size, shape and placement are considered according to your anatomy, existing breast tissue, chest proportions, skin quality and the result you would like to achieve. During your consultation, Dr. Nicole will also assess breast symmetry, natural breast position, desired projection and whether augmentation alone or a combination with a breast lift would be more appropriate. The surgical approach, incision placement and implant options are then discussed as part of a personalised plan designed around your body rather than a standard implant size or look.',
        // This page's own photograph rather than /breast-lift's — see OWN_IMG.
        image: {
          src: `${OWN_IMG}/procedure-augmentation.jpg`,
          alt: 'Close-up of a woman in a soft white bra against a warm neutral background',
        },
      },
    ],
    cta: { label: 'Book Your Consultation', href: '#book' },
  },

  /* ---------------------------------------------------------------- */

  /*
   * "Am I a good candidate? - Same section".
   *
   * Taken from /breast-lift word for word, with ONE change: the closing
   * sentence named "a Breast Lift & Augmentation" as the solution. Left alone
   * it would recommend a different operation from the one this page is about,
   * on a page whose own FAQ tells the reader the two are not the same thing.
   *
   * The criteria are untouched, including "Feel your breasts have begun to sag"
   * — that is the client's list and it is theirs to shorten. It does describe a
   * lift indication rather than an augmentation one, which is worth raising
   * with them.
   */
  candidacy: {
    eyebrow: 'Candidacy',
    heading: 'Am I a good candidate?',
    body: 'Many women notice changes in their breasts over time, particularly after pregnancy, breastfeeding, weight loss, or the natural ageing process. If you’ve been thinking about restoring breast shape, improving fullness, or achieving better symmetry, a Breast Augmentation may be the right solution.',
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

  /** "Meet your surgeon - Same section." */
  doctor: {
    eyebrow: 'Meet Your Surgeon',
    heading: 'Dr. Nicole Echeverry',
    role: 'Plastic, Aesthetic & Reconstructive Surgeon',
    pullQuote: doctorPullQuote,
    bio: doctorBio(TREATMENT),
    image: {
      // Shared with the other two pages: it is the same surgeon.
      src: '/images/mommy-makeover/doctor-portrait.jpg',
      alt: 'Dr. Nicole Echeverry seated, wearing a white tailored suit',
    },
    cta: { label: 'Book a Consultation with Dr. Nicole', href: '#book' },
    credentials: doctorCredentials,
  },

  /* ---------------------------------------------------------------- */

  /** "Why Ladies Choose Dr. Nicole? - Same section." */
  whyTrust: {
    eyebrow: 'Her Philosophy',
    heading: 'Why Ladies Choose Dr. Nicole?',
    pillars: whyTrustPillars(TREATMENT),
  },

  /* ---------------------------------------------------------------- */

  /*
   * "Before & after - Same section" — the same three clinic-supplied
   * composites as /breast-lift.
   *
   * The alt text still says "Breast Lift & Augmentation" and that is
   * deliberate. These are photographs of real patients and nobody has told us
   * which operation each of them had; relabelling them "Breast Augmentation"
   * because they now appear on the augmentation page would be a false claim
   * about a specific person, which is the one thing this file must never do.
   * Augmentation-only cases would be better here and are worth asking for.
   */
  results: {
    isPlaceholder: false,
    eyebrow: 'Real Results',
    heading: 'Before & After',
    lead: 'Every result belongs to a real woman with a real story. Dr. Nicole shares her full gallery personally during your consultation.',
    cases: [
      {
        id: 'case-1',
        image: {
          src: `${IMG}/results/case-1.jpg`,
          alt: 'Before and after a Breast Lift & Augmentation, angled view',
        },
      },
      {
        id: 'case-2',
        image: {
          src: `${IMG}/results/case-2.jpg`,
          alt: 'Before and after a Breast Lift & Augmentation, front view',
        },
      },
      {
        id: 'case-3',
        image: {
          src: `${IMG}/results/case-3.jpg`,
          alt: 'Before and after a Breast Lift & Augmentation, front view',
        },
      },
      {
        id: 'case-4',
        image: {
          src: `${IMG}/results/case-4.jpg`,
          alt: 'Before and after a Breast Lift & Augmentation, side view',
        },
      },
      {
        id: 'case-5',
        image: {
          src: `${IMG}/results/case-5.jpg`,
          alt: 'Before and after a Breast Lift & Augmentation, side view',
        },
      },
      {
        id: 'case-6',
        image: {
          src: `${IMG}/results/case-6.jpg`,
          alt: 'Before and after a Breast Lift & Augmentation, side view',
        },
      },
    ],
    disclaimer:
      'Photographs are illustrative of typical outcomes. Individual results vary and are determined by your own anatomy.',
    cta: { label: 'See More in a Private Consultation', href: '#book' },
  },

  /* ---------------------------------------------------------------- */

  /** "Your journey, step by step - Same section." */
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

  /** "Reviews - Same." */
  reviews: sharedReviews,

  /* ---------------------------------------------------------------- */

  /*
   * /breast-lift's eight questions plus the seven the client's document lists
   * under "New questions to add" — fifteen in total, none dropped.
   *
   * They are ordered by subject rather than appended in a block: implant
   * choice, placement and incisions belong next to "will there be scars", and
   * lift-versus-augmentation belongs next to "will it look natural". A reader
   * opening one question is usually interested in the ones either side of it,
   * and seven new questions bolted onto the end read as an afterthought.
   *
   * One existing answer changed: "Most Breast Lift & Augmentation procedures
   * take approximately 2–4 hours" now names this page's operation.
   */
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
        question: 'How is a natural-looking result planned?',
        answer:
          'Rather than choosing an implant based on size alone, the surgical plan considers how the breast will relate to your chest, waist and overall body proportions. Implant selection, positioning and the need for additional reshaping are personalised with the aim of creating balanced proportions that suit your anatomy.',
      },
      {
        question: 'How does Dr. Nicole choose the right breast implant?',
        answer:
          'Implant selection is personalised to your anatomy and aesthetic goals rather than based on size alone. Dr. Nicole considers factors such as your existing breast tissue, chest proportions, breast width, skin quality, symmetry and desired projection before recommending suitable implant options.',
      },
      {
        question: 'Where are breast implants placed?',
        answer:
          'Implant placement depends on your anatomy, existing breast tissue and surgical plan. Different placement approaches may be considered depending on what will provide appropriate support, coverage and proportions for your individual case. Dr. Nicole will explain the recommended approach during your consultation.',
      },
      {
        question: 'Where will the incisions be?',
        answer:
          'Incision placement is planned according to the procedure, implant choice where applicable, your anatomy and the surgical technique being used. Dr. Nicole carefully plans incisions with the aim of positioning scars as discreetly as reasonably possible and will explain their expected location before surgery.',
      },
      {
        question: 'Will there be visible scars?',
        answer:
          'Each incision is carefully planned to achieve the best possible aesthetic outcome while placing scars as discreetly as possible.',
      },
      {
        question: 'Do I need Breast Augmentation, a Breast Lift, or both?',
        answer:
          'It depends on what you would like to address. Breast Augmentation primarily restores or adds volume, while a Breast Lift reshapes and repositions breast tissue that has descended. When both loss of volume and changes in breast position are present, a combined Breast Lift and Augmentation may be considered. Dr. Nicole will assess your anatomy and recommend the most appropriate approach during your consultation.',
      },
      {
        question: 'Can breast asymmetry be addressed during Breast Augmentation?',
        answer:
          'In some cases, breast augmentation can be planned to improve differences in breast volume, shape or proportion. The appropriate approach depends on the type and degree of asymmetry, which Dr. Nicole will assess during your consultation.',
      },
      {
        question: 'How long does the procedure take?',
        answer:
          'Most Breast Augmentation procedures take approximately 2–4 hours, depending on your personalized treatment plan.',
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
        question: 'How much does Breast Augmentation or Breast Lift cost in Dubai?',
        answer:
          'The cost of breast surgery varies depending on your individual treatment plan. Factors can include the type of procedure, the choice of breast implants where applicable, surgical complexity, anaesthesia and facility requirements, and whether procedures such as a Breast Lift and Augmentation are performed together. Following your consultation and assessment, you will receive a personalised surgical plan and the relevant treatment cost.',
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
