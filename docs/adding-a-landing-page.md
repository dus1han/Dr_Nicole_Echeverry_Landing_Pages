# Recipe: Adding Landing Page #2

This project is a **platform**, not a one-off page. `/mommy-makeover` is the first campaign; `/breast-augmentation`, `/tummy-tuck`, `/rhinoplasty` and the rest are meant to be quick.

**Target: a new landing page is one content file plus a ~20-line route.** No new components, no new CSS, no design work.

---

## The shape

```
content/
├── types.ts               ← the contract (shared, don't edit per page)
├── site.ts                ← clinic-wide details (shared, edit once ever)
├── mommy-makeover.ts      ← page 1 copy
└── breast-augmentation.ts ← page 2 copy   ← you write this

app/
├── mommy-makeover/page.tsx
└── breast-augmentation/page.tsx           ← and this
```

---

## Step 1 — Write the content file

Copy `content/mommy-makeover.ts`, rename it, and replace the strings. TypeScript will refuse to compile until every required field is present — that's deliberate. It's impossible to ship a page with a missing headline or a broken CTA.

```ts
import type { LandingPageContent } from './types';

export const breastAugmentation: LandingPageContent = {
  slug: 'breast-augmentation',
  meta: {
    title: 'Breast Augmentation in Dubai | Dr. Nicole Echeverry',
    description: '…',
    ogImageAlt: '…',
  },
  hero: {
    eyebrow: 'DUBAI · PLASTIC & RECONSTRUCTIVE SURGERY',
    headline: ['Beautifully', 'Proportioned. Entirely Yours.'],
    subheadline: '…',
    image: '/images/breast-augmentation/hero.jpg',
    badges: ['…', '…'],
    primaryCta: { label: 'Book Your Consultation', href: '#book' },
    secondaryCta: { label: 'See The Results', href: '#results' },
  },
  // …the remaining sections
};
```

## Step 2 — Create the route

```tsx
// app/breast-augmentation/page.tsx
import { breastAugmentation as content } from '@/content/breast-augmentation';
import { buildMetadata } from '@/lib/schema';
import { Hero, WhatIsIt, Procedures, MeetDoctor, WhyTrust,
         BeforeAfter, Reviews, Faq, ConfidenceCta, BookingForm } from '@/components/sections';

export const metadata = buildMetadata(content);

export default function Page() {
  return (
    <>
      <Hero          {...content.hero} />
      <WhatIsIt      {...content.whatIsIt} />
      <Procedures    {...content.procedures} />
      <MeetDoctor    {...content.doctor} />
      <WhyTrust      {...content.whyTrust} />
      <BeforeAfter   {...content.results} />
      <Reviews       {...content.reviews} />
      <Faq           {...content.faq} />
      <ConfidenceCta {...content.closingCta} />
      <BookingForm   {...content.booking} />
    </>
  );
}
```

Sections are **optional and reorderable**. A breast-augmentation page might drop `Candidacy` and add an `ImplantOptions` block. The other twelve come free.

## Step 3 — Drop in the images

`public/images/breast-augmentation/` — page-scoped so assets never collide between campaigns.

## Step 4 — Register it

Add the slug to `content/site.ts` → `landingPages[]`. That single edit automatically:
- adds it to the footer's "Other treatments" list,
- includes it in `sitemap.ts`,
- makes it appear on the root index page.

## Step 5 — Ship

`npm run build` · push · done. No config changes, ever.

---

## Rules that keep this fast

1. **Never hard-code a string in a component.** If you're typing English into `components/`, stop — it belongs in a content file.
2. **Never add a colour outside `@theme`.** If a page needs a new shade, add the token so *every* page can use it.
3. **New section? Build it generically.** Take copy as props, ship it in `components/sections/`, add its type to `types.ts` as optional. Page 3 will thank you.
4. **Contact details live only in `site.ts`.** When the clinic's phone number changes it must be a one-line edit across the whole site.
5. **Keep the shell untouched.** Nav, footer, floating CTAs and the announcement bar are shared. Per-page nav links come from that page's section list, generated automatically.

---

## What's genuinely per-page

| Shared forever | Written per page |
|---|---|
| Colour tokens, type scale, spacing | Headlines and body copy |
| Motion system and easings | Images |
| Buttons, cards, inputs, accordion | Section order |
| Nav, footer, floating CTAs | Meta title/description |
| All 13 section components | FAQ questions |
| Form + API route | Procedure lists |

If you find yourself editing the left column to ship a new page, the abstraction has slipped — fix it there rather than forking.
