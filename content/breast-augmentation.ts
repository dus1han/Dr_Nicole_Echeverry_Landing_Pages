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
 * section". Those were taken from /breast-lift verbatim.
 *
 * Candidacy is no longer among them — a later delivery (18 Sep 2026) gave
 * this page its own copy for that section. See the note above `candidacy`.
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
   * "What It Involves" rather than /breast-lift's "Procedures". It was chosen
   * when this page had a single card, to avoid a plural label above it; the
   * section now carries three technique cards, so either label would be
   * accurate and this one is kept because it is also the section's own
   * eyebrow, which keeps the nav and the heading agreeing.
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
    body: 'Breast augmentation is a surgical procedure designed to enhance or restore breast volume, shape and projection. Depending on your anatomy and goals, augmentation may involve breast implants, fat transfer, or a personalised combination of techniques where appropriate.',
    /*
     * Statements, not links — see the note on `chips` in content/types.ts.
     * /breast-lift's four chips each jump to one of its four procedure cards.
     * This page has three cards, but these four lines are outcomes rather than
     * techniques and do not correspond to them one for one, so there is no
     * card to send a reader to and they carry no href.
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
   * Three techniques, supplied by the client 17 Sep 2026, replacing the single
   * card this section used to carry.
   *
   * This is what makes the section heading honest. "Breast Augmentation
   * Options" went in ahead of the cards and was briefly a plural promising a
   * choice the page then did not lay out; the three cards are the choice.
   *
   * Each card now carries a `name`, which the single card deliberately omitted
   * — with one card the heading above it had already named the operation, and
   * with three the reader needs to know which technique they are reading about.
   *
   * `benefits` stays absent on all three. The client's copy for each is one
   * paragraph, and bullet points nobody wrote under a description of surgery
   * are an invented claim about what the technique achieves.
   *
   * A count divisible by three lays out 3-across on desktop and 2-across on
   * tablet with no part-empty row — see the grid note in Procedures.tsx.
   */
  procedures: {
    eyebrow: 'What It Involves',
    heading: 'Breast Augmentation Options',
    items: [
      {
        id: 'implants',
        name: 'Breast Implants',
        description:
          'Breast implants can be selected according to your breast width, existing tissue, desired projection and overall proportions. Dr. Nicole works with established implant brands including Motiva, Mentor, Polytech and GCA, with implant selection personalised during consultation.',
        /*
         * One designed set, in this page's own folder rather than
         * /breast-lift's — see OWN_IMG. Cropped 4:3 from square sources by
         * `buildOptionCards` in scripts/prepare-assets.mjs so the file matches
         * the card box instead of being trimmed by the browser.
         */
        image: {
          src: `${OWN_IMG}/option-implants.jpg`,
          alt: 'A woman in a soft pink bra beside an inset illustration of a breast implant',
        },
      },
      {
        id: 'fat-transfer',
        name: 'Fat Transfer',
        description:
          'For suitable patients, fat transfer may be considered to enhance breast volume using carefully selected fat from another area of the body. Suitability depends on your anatomy, available donor fat and desired degree of augmentation.',
        image: {
          src: `${OWN_IMG}/option-fat-transfer.jpg`,
          alt: 'A woman in a soft pink bra beside an inset illustration of a vial and syringe',
        },
      },
      {
        id: 'hybrid',
        name: 'Hybrid Breast Augmentation',
        description:
          'In selected cases, implants and fat transfer may be combined to refine breast shape, contour or proportions. Dr. Nicole will determine whether a hybrid approach is appropriate following an individual assessment.',
        image: {
          src: `${OWN_IMG}/option-hybrid.jpg`,
          alt: 'A woman in a soft pink bra beside an inset illustration of an implant and a syringe',
        },
      },
    ],
    cta: { label: 'Book Your Consultation', href: '#book' },
  },

  /* ---------------------------------------------------------------- */

  /*
   * Client copy, 18 Sep 2026. No longer /breast-lift's.
   *
   * This section used to be /breast-lift's word for word, which is why the
   * note that stood here flagged "Feel your breasts have begun to sag or sit
   * lower than before" as a LIFT indication sitting on the augmentation page.
   * The new list drops it, so that objection is resolved rather than still
   * outstanding.
   *
   * The register changes with it: the old copy told the reader an operation
   * "may be the right solution" and asserted what they would like, where this
   * describes what a patient might come in to discuss. On a surgical page
   * that is the more defensible of the two, and it is theirs either way.
   *
   * `leadIn` is KEPT, and it is the one line here not supplied in the new
   * copy. Two reasons: the field is required by CandidacyContent, and every
   * new criterion is a sentence fragment — "Would like to increase or restore
   * breast volume" has no subject, so without a lead-in the list dangles off
   * the end of the paragraph. It is also the client's own existing wording
   * rather than something invented here. If they want it gone the field has
   * to become optional and Candidacy.tsx has to stop rendering the <p>.
   */
  candidacy: {
    eyebrow: 'Candidacy',
    heading: 'Am I a good candidate?',
    body: 'Breast augmentation may be considered by patients who would like to increase or restore breast volume, address differences in breast size or discuss changes following pregnancy, breastfeeding or weight changes.',
    leadIn: 'You may be a suitable candidate if you:',
    /*
     * No trailing full stops, unlike the list this replaces. That is how the
     * client supplied them and they are consistent with each other, which is
     * the only thing that shows on the page.
     */
    criteria: [
      'Would like to increase or restore breast volume',
      'Would like to discuss breast shape or proportion',
      'Have differences in breast size or symmetry',
      'Have experienced volume changes after pregnancy, breastfeeding or weight loss',
      'Would like to understand whether breast implants are suitable for your goals',
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
      /*
       * Client copy, 18 Sep 2026. Placed directly after the question above
       * because they cover the same ground and should be read together.
       *
       * As supplied it said "within around one week", against the 1–2 weeks
       * the answer above gives. Two different recovery figures for the same
       * operation, and both feed this page's FAQPage structured data, so the
       * disagreement would have gone to Google as well as to the reader. The
       * clinic settled it at 1–2 weeks (18 Sep 2026) and this answer carries
       * that figure. Keep the two in step: changing one means changing both.
       *
       * Two edits to the supplied text, neither a wording choice:
       *   "scar care advise" → "advice" (misspelling)
       *   Title Case question → sentence case, to match the other fifteen
       */
      {
        question: 'What to expect during Breast Augmentation recovery?',
        answer:
          'Recovery after breast augmentation is gradual, and every patient heals at her own pace. During the first few days, some swelling, tightness, tenderness, and temporary sensitivity are expected. You’ll wear a supportive surgical bra to support the breasts as they heal and settle into their new shape.\n\nMany patients can return to light daily activities within 1–2 weeks, depending on their recovery and the type of procedure performed. Strenuous exercise, heavy lifting, and upper-body workouts should be avoided until the doctor advises. Scheduled follow-up appointments allow Dr. Nicole to monitor your healing, provide scar care advice and guide you through each stage of recovery.',
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
      /*
       * Client copy, 18 Sep 2026. Two paragraphs, separated by a blank line
       * and rendered as two by Faq.tsx.
       *
       * This is the only mention of ABU DHABI on the site — every other page,
       * the metadata and the JSON-LD say Dubai. Queried with the client and
       * confirmed correct (18 Sep 2026), so it stays. Worth knowing it is
       * deliberate rather than a stray, because this answer feeds the FAQPage
       * structured data and is therefore a geography signal to Google.
       *
       * Question wording is the client's; only its capitalisation was changed,
       * to sentence case, so it sits with the other fifteen.
       */
      {
        question: 'How much does Breast Augmentation cost in Dubai & Abu Dhabi?',
        answer:
          'The cost of breast augmentation in Dubai and Abu Dhabi varies because every procedure is personalized to the patient. Your final price will depend on factors such as the type and brand of implant, surgical technique, and whether breast augmentation is combined with a lift or another procedure.\n\nDr. Nicole first assesses your anatomy, desired breast shape and volume, and the most suitable surgical approach. Following your consultation, you’ll receive a clear, personalized quotation based on your recommended treatment plan.',
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
