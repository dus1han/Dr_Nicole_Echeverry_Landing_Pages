import type {
  BookingContent,
  CredentialMark,
  ReviewsContent,
  TrustStripContent,
  WhyTrustContent,
} from './types';

/**
 * Content that is the SAME on every landing page.
 *
 * The clinic's brief for page two said "same description", "same reviews" —
 * meaning the surgeon, her credentials, the reviews and the enquiry form do not
 * change from one treatment to the next. Only the treatment content does.
 *
 * Shared here rather than copied into each page, because copies drift. Correct
 * one review in one file and the other page keeps the typo; the failure is
 * silent and nobody finds it until a client reads their own site.
 *
 * A page still owns anything that names its own procedure — see
 * `whyTrustPillars` and `doctorBio` below, which take the treatment name.
 */

export const sharedTrust: TrustStripContent = {
  /*
   * Client-supplied, 3 Aug 2026 — these replaced four invented figures.
   *
   * "Zero scars on body" is the client's wording and is repeated verbatim.
   * See docs/open-questions.md: surgery leaves a scar by definition, so this
   * reads as a claim about placement rather than absence, and it is worth a
   * second look before it runs in paid advertising on any page.
   */
  isPlaceholder: false,
  stats: [
    { value: 19, suffix: '+', label: 'Years of experience' },
    { text: 'Double', label: 'Board certified' },
    { text: 'Zero', label: 'Scars on body' },
    { text: 'Personalized', label: 'Surgical planning' },
  ],
};

/**
 * Substantiates "international training" in the bio, which is otherwise a claim
 * the reader has to take on faith.
 *
 * Names are alt text and tooltips only. Setting five institution names as
 * visible copy would compete with the bio for attention; the marks are
 * recognised on sight by the audience that cares.
 */
export const doctorCredentials: { label: string; items: CredentialMark[] } = {
  label: 'Training & Affiliations',
  items: [
    { name: 'American Society of Plastic Surgeons', src: '/logo/credentials/asps.png' },
    {
      name: 'International Society of Aesthetic Plastic Surgery',
      src: '/logo/credentials/isaps.png',
    },
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
};

/**
 * The surgeon's bio, with the treatment named.
 *
 * Every word is the client's. Only the procedure changes, because a bio that
 * says "Mommy Makeover" on a breast surgery page reads as a copy-paste mistake
 * — which is exactly what it would be.
 */
export const doctorBio = (treatment: string) =>
  'Dr. Nicole Echeverry is a Colombian Plastic, Aesthetic, and Reconstructive Surgeon ' +
  'with international training and extensive experience in aesthetic breast surgery, ' +
  'body contouring, and post-pregnancy body restoration. Understanding that every ' +
  `woman’s journey is unique, Dr. Nicole carefully tailors each ${treatment} to the ` +
  'individual’s anatomy, lifestyle, and goals.';

/** The pull-quote, promoted out of the bio so it is never read twice. */
export const doctorPullQuote =
  'Every treatment plan is designed to help you feel confident, comfortable, and like yourself again.';

/** Her four principles. Only the second names a treatment. */
export const whyTrustPillars = (treatment: string): WhyTrustContent['pillars'] => [
  {
    icon: 'artistry',
    title: 'Colombian Aesthetic Artistry',
    description:
      'A philosophy of creating elegant, natural-looking transformations inspired by Colombian aesthetic artistry.',
  },
  {
    icon: 'personalised',
    title: 'Tailored to the Individual',
    description: `Every ${treatment} is carefully tailored to your anatomy, your lifestyle, and your goals.`,
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
];

/**
 * The enquiry form. Identical everywhere — the page it was submitted from is
 * carried in the payload, not in the wording.
 */
export const sharedBooking: BookingContent = {
  heading: 'Book Your Consultation',
  submitLabel: 'Book My Consultation',
  successTitle: 'Thank you.',
  successBody:
    'Dr. Nicole’s team will contact you within one working day to arrange your private consultation.',
  consentNote:
    'By requesting a consultation you agree to be contacted about your enquiry.',
};

/**
 * Real, client-supplied reviews — the same six on every page.
 *
 * Spelling and grammar are left as the patients wrote them ("awsome", "with my
 * eyes close"): a testimonial that has been tidied up is no longer the words
 * the patient wrote, and on a medical page that distinction is worth more than
 * the polish.
 *
 * `rating` and `descriptor` are absent because none were supplied. Five stars
 * is the likely answer and that is not good enough to publish under a real
 * person's name; both reappear with no code change once given.
 */
export const sharedReviews: ReviewsContent = {
  isPlaceholder: false,
  eyebrow: 'In Their Words',
  heading: 'Patient Reviews',
  items: [
    {
      title: 'I Love my Body! My body came out beautiful, my skin was fixed',
      quote:
        'My experience with Dr. Echeverry was absolutely amazing! I had liposculpture with her and her husband Dr. Reyes. The work was phenomenal. Dr. Echeverry was so sweet, she even fixed my acne with some prescription acne medication. My body came out beautiful, my skin was fixed, thanks to Dr. Echeverry.',
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
        'I did with the dr a full facelift. My results was awsome. I am so happy with all the procedures. I am so beautiful now. Trust me, this is the best place to do your surgery.',
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
};
