import type { LandingPageContent } from './types';

const IMG = '/images/mommy-makeover';

/**
 * Copy for /mommy-makeover.
 *
 * Sourced from "Mommy Makeover in Dubai LP content.docx". Every substantive
 * line of that document is used. Mapping: docs/content-map.md
 */
export const mommyMakeover: LandingPageContent = {
  slug: 'mommy-makeover',

  meta: {
    title: 'Mommy Makeover in Dubai | Dr. Nicole Echeverry',
    description:
      'Feel like yourself again with a personalised Mommy Makeover in Dubai by Dr. Nicole Echeverry — world-class body contouring inspired by Colombian aesthetic artistry. Book a private consultation.',
    ogHeadline: 'Feel Like Yourself Again',
  },

  nav: [
    { label: 'What Is It', href: '#what-is-it' },
    { label: 'Procedures', href: '#procedures' },
    { label: 'Dr. Nicole', href: '#meet-dr-nicole' },
    { label: 'Results', href: '#results' },
    { label: 'FAQ', href: '#faq' },
  ],

  announcements: [
    'Colombian Aesthetic Artistry',
    'Plastic, Aesthetic & Reconstructive Surgeon',
    'Private Consultations in Dubai',
    'Personalised Treatment Plans',
  ],

  /* ---------------------------------------------------------------- */

  hero: {
    /*
     * "Mommy Makeover in Dubai" is the focal line — it is the phrase she is
     * searching for and the one that has to land in the first second. "Feel
     * Like Yourself Again" sits above it as a smaller emotional lead-in.
     * (Earlier this was the other way round, which buried the treatment name.)
     */
    headline: {
      leadIn: 'Feel Like Yourself Again',
      focus: 'Mommy Makeover in Dubai',
    },
    attribution: 'with Dr. Nicole Echeverry',
    subheadline:
      'World-class body contouring inspired by Colombian aesthetic artistry.',
    image: {
      src: `${IMG}/hero.jpg`,
      alt: 'A woman in neutral activewear standing confidently in a light, calm interior',
    },
    primaryCta: { label: 'Book Your Consultation', href: '#book' },
    secondaryCta: { label: 'See The Results', href: '#results' },
  },

  /* ---------------------------------------------------------------- */

  trust: {
    // TODO: real figures needed from the client — see docs/open-questions.md.
    isPlaceholder: true,
    stats: [
      { value: 10, suffix: '+', label: 'Years of surgical experience' },
      { value: 1500, suffix: '+', label: 'Procedures performed' },
      { value: 3, label: 'Countries trained in' },
      { value: 98, suffix: '%', label: 'Patient satisfaction' },
    ],
  },

  /* ---------------------------------------------------------------- */

  whatIsIt: {
    eyebrow: 'The Procedure',
    heading: 'What is a Mommy Makeover?',
    body: 'A Mommy Makeover is a personalized combination of procedures designed to restore and refine the natural contours of your body following pregnancy, childbirth, and breastfeeding.',
    leadIn: 'Depending on your goals, your Mommy Makeover may include procedures such as:',
    chips: [
      { label: 'Tummy Tuck', href: '#tummy-tuck' },
      { label: 'Breast Lift or Augmentation', href: '#breast' },
      { label: 'Liposuction', href: '#liposuction' },
    ],
    image: {
      src: `${IMG}/surgeon-operating.jpg`,
      alt: 'Dr. Nicole Echeverry in surgical cap and mask, concentrating during an operation',
    },
    imageCaption: 'Dr. Nicole in theatre',
  },

  /* ---------------------------------------------------------------- */

  procedures: {
    eyebrow: 'What It May Include',
    heading: 'Procedures, combined around you',
    items: [
      {
        id: 'tummy-tuck',
        name: 'Tummy Tuck',
        description:
          'A tummy tuck removes excess skin after pregnancy and repairs stretched abdominal muscles to create a flatter, firmer tummy.',
        benefits: [
          'Removes excess skin',
          'Repairs separated abdominal muscles',
          'Creates a firmer, flatter tummy',
        ],
        image: {
          src: `${IMG}/procedure-tummy.jpg`,
          alt: 'A woman’s toned midsection in neutral activewear',
        },
      },
      {
        id: 'breast',
        name: 'Breast Lift or Augmentation',
        description:
          'A breast lift reshapes and lifts the breasts, while breast augmentation restores or increases volume to achieve a fuller, more balanced appearance.',
        benefits: [
          'Restores shape and fullness',
          'Improves breast position',
          'Enhances natural proportions',
        ],
        image: {
          src: `${IMG}/procedure-breast.jpg`,
          alt: 'A woman in a neutral-toned bodysuit, photographed from the shoulders down',
        },
      },
      {
        id: 'liposuction',
        name: 'Liposuction',
        description:
          'Liposuction removes unwanted fat from specific areas of the body to improve contours and create more balanced proportions. It can be performed on the abdomen, waist, flanks, hips, and thighs, including 360° lipo body contouring.',
        benefits: [
          'Targets stubborn fat deposits',
          'Sculpts the waist and body contours',
          'Creates a more balanced silhouette',
        ],
        image: {
          src: `${IMG}/procedure-lipo.jpg`,
          alt: 'Profile view of a woman’s contoured waist and hips against a warm neutral background',
        },
      },
    ],
    cta: { label: 'Book Your Consultation', href: '#book' },
  },

  /* ---------------------------------------------------------------- */

  candidacy: {
    eyebrow: 'Candidacy',
    heading: 'Am I the right candidate?',
    body: 'Every woman’s body responds differently to pregnancy and childbirth. If you’ve maintained a healthy lifestyle but still struggle with changes that diet and exercise alone can’t improve, a personalized Mommy Makeover can help restore balance, shape, and confidence.',
    leadIn: 'You may be a good candidate if you:',
    criteria: [
      'Have completed your family or are not planning another pregnancy in the near future.',
      'Have loose abdominal skin or muscle separation following pregnancy.',
      'Experience sagging or volume loss in your breasts after breastfeeding.',
      'Maintain a stable weight but struggle with stubborn areas of fat.',
      'Feel your body no longer reflects how you feel inside.',
      'Are in good overall health and looking for a comprehensive body restoration procedure.',
    ],
    cta: { label: 'Request an Honest Assessment', href: '#book' },
    image: {
      src: `${IMG}/procedure-lipo.jpg`,
      alt: 'Profile view of a woman’s silhouette against a soft neutral background',
    },
  },

  /* ---------------------------------------------------------------- */

  doctor: {
    eyebrow: 'Meet Your Surgeon',
    heading: 'Dr. Nicole Echeverry',
    role: 'Plastic, Aesthetic & Reconstructive Surgeon',
    /*
     * The client's bio is used in full — the closing sentence is simply
     * PROMOTED to the pull-quote rather than repeated. It is the line that
     * answers "will she listen to me?", so it earns the emphasis, and this
     * way every supplied word still appears exactly once.
     */
    pullQuote:
      'Every treatment plan is designed to help you feel confident, comfortable, and like yourself again.',
    bio: 'Dr. Nicole Echeverry is a Colombian Plastic, Aesthetic, and Reconstructive Surgeon with international training and extensive experience in aesthetic breast surgery, body contouring, and post-pregnancy body restoration. Understanding that every woman’s journey through motherhood is unique, Dr. Nicole carefully tailors each Mommy Makeover to the individual’s anatomy, lifestyle, and goals.',
    image: {
      src: `${IMG}/doctor-portrait.jpg`,
      alt: 'Dr. Nicole Echeverry seated, wearing a white tailored suit',
    },
    cta: { label: 'Book a Consultation with Dr. Nicole', href: '#book' },

    /*
     * Substantiates "international training" in the bio directly above, which
     * is otherwise a claim the reader has to take on faith.
     *
     * Names are alt text and tooltips only. Setting five institution names as
     * visible copy would compete with the bio for attention and give the band
     * five different typefaces' worth of visual noise; the marks are recognised
     * on sight by the audience that cares.
     */
    credentials: {
      label: 'Training & Affiliations',
      items: [
        { name: 'American Society of Plastic Surgeons', src: '/logo/credentials/asps.png' },
        { name: 'International Society of Aesthetic Plastic Surgery', src: '/logo/credentials/isaps.png' },
        {
          name: 'Arab Association of Surgical and Medical Aesthetics',
          src: '/logo/credentials/aasma.png',
        },
        {
          name: 'Universidad del Sinú — Elías Bechara Zainúm',
          src: '/logo/credentials/universidad-del-sinu.png',
        },
        { name: 'Universidad del Tolima', src: '/logo/credentials/universidad-del-tolima.png' },
      ],
    },
  },

  /* ---------------------------------------------------------------- */

  whyTrust: {
    eyebrow: 'Her Philosophy',
    heading: 'Why Trust Dr. Nicole with Your Mommy Makeover?',
    /*
     * The client's source paragraph is split across the four pillars below,
     * sentence by sentence — every word of it is on the page. It is NOT also
     * rendered as a lead: doing both made the visitor read the same content
     * twice and produced the largest block of text on the page.
     */
    pillars: [
      {
        icon: 'artistry',
        title: 'Colombian Aesthetic Artistry',
        description:
          'A philosophy of creating elegant, natural-looking transformations inspired by Colombian aesthetic artistry.',
      },
      {
        icon: 'personalised',
        title: 'Tailored to the Individual',
        description:
          'Every Mommy Makeover is carefully tailored to your anatomy, your lifestyle, and your goals.',
      },
      {
        icon: 'harmony',
        title: 'Harmony, Not Drama',
        description:
          'Restoring harmony through refined body contouring rather than dramatic change.',
      },
      {
        icon: 'care',
        title: 'Care at Every Stage',
        description:
          'From your initial consultation through every stage of recovery, Dr. Nicole and her team remain closely involved.',
      },
    ],
  },

  /* ---------------------------------------------------------------- */

  results: {
    // DUMMY CONTENT — plates generated from the supplied body photography.
    // No real patient is depicted. Replace with consented photographs and set
    // this to false. See docs/open-questions.md.
    /*
     * Real, clinic-supplied photographs — no longer placeholders, so the sample
     * ribbons no longer render.
     *
     * `caption` and `detail` are deliberately omitted. The previous values
     * ("Breast lift", "6 months post-op") were invented to make the dummy
     * gallery look plausible. Under a real patient's photograph the same words
     * stop being placeholder text and become a clinical claim about a specific
     * person, so they are gone until the clinic supplies the real ones.
     */
    isPlaceholder: false,
    eyebrow: 'Real Results',
    heading: 'Before & After',
    lead: 'Every result belongs to a real woman with a real story. Dr. Nicole shares her full gallery personally during your consultation.',
    cases: [
      { id: 'case-1', image: { src: `${IMG}/results/case-1.jpg`, alt: 'Before and after a Mommy Makeover' } },
      { id: 'case-2', image: { src: `${IMG}/results/case-2.jpg`, alt: 'Before and after a Mommy Makeover' } },
      { id: 'case-3', image: { src: `${IMG}/results/case-3.jpg`, alt: 'Before and after a Mommy Makeover' } },
      { id: 'case-4', image: { src: `${IMG}/results/case-4.jpg`, alt: 'Before and after a Mommy Makeover' } },
      { id: 'case-5', image: { src: `${IMG}/results/case-5.jpg`, alt: 'Before and after a Mommy Makeover' } },
      { id: 'case-6', image: { src: `${IMG}/results/case-6.jpg`, alt: 'Before and after a Mommy Makeover' } },
    ],
    /*
     * RETAINED BUT NOT RENDERED. The client asked for this to be removed from
     * the page; the wording is kept here so reinstating it is one paragraph in
     * BeforeAfter.tsx rather than a rewrite.
     *
     * Client-supplied wording. One correction: the original said "your own
     * FACIAL anatomy" — this is a body page (tummy tuck, breast, liposuction),
     * so it reads "your own anatomy". The facial wording looks carried over
     * from a different treatment page.
     */
    disclaimer:
      'Photographs are illustrative of typical outcomes. Individual results vary and are determined by your own anatomy.',
    cta: { label: 'See More in a Private Consultation', href: '#book' },
  },

  /* ---------------------------------------------------------------- */

  journey: {
    eyebrow: 'What to Expect',
    heading: 'Your journey, step by step',
    lead: 'The unknown is the hardest part. Here is exactly what happens, from your first message to your last follow-up.',
    // Tightened for the horizontal 5-across layout — each description is one
    // short sentence so the columns stay even and the section stays compact.
    steps: [
      {
        title: 'Private Consultation',
        description:
          'An unhurried conversation about your history, your goals, and what is realistic for your body.',
      },
      {
        title: 'Your Personalised Plan',
        description:
          'A combination of procedures matched to your anatomy, lifestyle and recovery window.',
      },
      {
        title: 'Preparation',
        description:
          'Assessments, clear guidance and a checklist, so nothing about the day is a surprise.',
      },
      {
        title: 'Your Surgery Day',
        description:
          'An accredited facility, a full surgical team, and Dr. Nicole present at every stage.',
      },
      {
        title: 'Guided Recovery',
        description:
          'Scheduled follow-ups and direct access to the team — you are never left to guess.',
      },
    ],
  },

  /* ---------------------------------------------------------------- */

  reviews: {
    /*
     * REAL, client-supplied reviews. `isPlaceholder: false` turns off the dev
     * warning and turns on the "Verified patient" badge.
     *
     * Reproduced as supplied. The originals carry a few spelling and grammar
     * slips ("awsome", "with my eyes close") and they are kept — a testimonial
     * that has been tidied up is no longer the words the patient wrote, and on
     * a medical page that distinction is worth more than the polish.
     *
     * `rating` is absent throughout because no ratings were supplied. Five
     * stars is the likely answer and that is not a good enough reason to
     * publish it under a real person's name; the stars simply do not render.
     * Supply the real ratings and they come back with no code change.
     *
     * `descriptor` is likewise absent — these arrived as usernames with no
     * location or context.
     */
    isPlaceholder: false,
    eyebrow: 'In Their Words',
    heading: 'Patient Reviews',
    items: [
      {
        title: 'I Love my Body! My body came out beautiful, my skin was fixed',
        quote:
          'My experience with Dr. Echeverry was absolutely amazing! I had liposculpture with her and her husband Dr. Reyes. The work was phenomenal. Everything healed extremely quickly. Dr. Echeverry was so sweet, she truly is a Barbie body sculptor. Not only did she give me my dream body, but she even fixed my acne with some prescription acne medication. My body came out beautiful, my skin was fixed, thanks to Dr. Echeverry.',
        name: 'Laluna2016',
      },
      {
        title: 'Completely natural results — now I can wear all the t-shirts I like',
        quote:
          'What a satisfactory experience doctor Nicole is not just a great and fantastic surgeon is also a fantastic person. I got such beautiful results in my breast, completely natural now I can wear all the T-shirts I like. I recommend her 100% even with my eyes close.',
        name: 'Gentle634576',
      },
      {
        title: 'Nicole is the Barbie Surgeon!',
        quote:
          'Nicole will give you results that are just as beautiful as she is! She works hand in hand with her husband and they are the perfect team! I am so glad I came to them. I now have family in Colombia! She applied a female touch to the work I wanted done. Thank you Nicole!',
        name: 'The Cam Show',
      },
      {
        quote:
          'I did with the dr a full facelift. My results was awsome. I am so happy with all the procedures. I am so beautiful now. Trust me, this is the best place to do your surgery. You have to come to Colombia to do it.',
        name: 'Luz Pedreros',
      },
      {
        quote:
          'The chemistry of feeling great! From the consultation to today, I had a professional and passionate team, working in love to best results. Can’t be more grateful for their service and best to serve and accomplish my expectations.',
        name: 'Eroga',
      },
      {
        quote:
          'This woman is amazing, smart, and knows exactly how a surgical procedure should go. Dedicated, patient, answered all my questions even though I was so scared. I had previously deformed breasts and this doctor gave me my breasts back… including my confidence! I cannot thank her enough!!!!!',
        name: 'Celebrated90713',
      },
    ],
  },

  /* ---------------------------------------------------------------- */

  faq: {
    eyebrow: 'Questions',
    heading: 'Frequently Asked Questions',
    items: [
      {
        question: 'Will I still look natural?',
        answer:
          'Absolutely. Dr. Nicole focuses on restoring your body’s natural proportions rather than creating an exaggerated appearance. Every treatment plan is personalized to complement your unique shape.',
      },
      {
        question: 'What procedures are included in a Mommy Makeover?',
        answer:
          'Every Mommy Makeover is customized. Depending on your goals, it may include a tummy tuck, breast lift, breast augmentation, liposuction, or other body contouring procedures discussed during your consultation.',
      },
      {
        question: 'Can everything be done in one surgery?',
        answer:
          'For suitable candidates, multiple procedures can often be safely combined into one carefully planned operation, allowing for a single recovery period. Your treatment plan will depend on your health, goals, and surgical assessment.',
      },
      {
        question: 'How long is the recovery?',
        answer:
          'Recovery varies depending on the procedures performed. Most patients gradually return to light daily activities within a few weeks, while full recovery takes longer. Dr. Nicole will guide you through every stage of healing.',
      },
      {
        question: 'Will there be scars?',
        answer:
          'Every surgical procedure creates some scarring, but incisions are carefully planned to be as discreet as possible and placed where they can typically be concealed beneath clothing or swimwear.',
      },
      {
        question: 'Is a Mommy Makeover only for mothers?',
        answer:
          'Although it was originally developed for women after pregnancy, the procedures included in a Mommy Makeover can also benefit anyone experiencing similar concerns such as loose skin, breast changes, or stubborn fat deposits.',
      },
      {
        question: 'When is the right time to have a Mommy Makeover?',
        answer:
          'The ideal time is after you’ve completed your family, finished breastfeeding, reached a stable weight, and are ready to invest in yourself with adequate time for recovery.',
      },
    ],
    footerNote: 'Still have a question?',
    footerCta: { label: 'Ask Dr. Nicole directly', href: 'whatsapp' },
  },

  /* ---------------------------------------------------------------- */

  /*
   * `closingCta` is intentionally absent — the "Your Confidence Deserves Your
   * Attention" section was removed from this page. The ConfidenceCta component
   * remains available for other landing pages.
   */

  /* ---------------------------------------------------------------- */

  /*
   * Stripped to a heading and the form at the client's request: the supporting
   * copy, the three assurances and the privacy line are all gone. The section
   * is now a single centred column.
   */
  booking: {
    heading: 'Book Your Consultation',
    submitLabel: 'Book My Consultation',
    successTitle: 'Thank you.',
    successBody:
      'Dr. Nicole’s team will contact you within one working day to arrange your private consultation.',
    consentNote:
      'By requesting a consultation you agree to be contacted about your enquiry.',
  },

  /*
   * `map` is intentionally absent — the "Visit the Clinic" section was removed
   * from this page. The clinic name, address and directions link still appear
   * in the footer. The ClinicMap component remains available for other pages.
   */
};
