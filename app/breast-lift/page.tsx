import type { Metadata } from 'next';
import { breastLift as content } from '@/content/breast-lift';
import { buildJsonLd } from '@/lib/schema';
import { pageTitle } from '@/content/site';
import { PageShell } from '@/components/layout/PageShell';
import { Hero } from '@/components/sections/Hero';
import { TrustStrip } from '@/components/sections/TrustStrip';
import { WhatIsIt } from '@/components/sections/WhatIsIt';
import { Procedures } from '@/components/sections/Procedures';
import { Candidacy } from '@/components/sections/Candidacy';
import { MeetDoctor } from '@/components/sections/MeetDoctor';
import { WhyTrust } from '@/components/sections/WhyTrust';
import { BeforeAfter } from '@/components/sections/BeforeAfter';
import { Journey } from '@/components/sections/Journey';
import { Reviews } from '@/components/sections/Reviews';
import { Faq } from '@/components/sections/Faq';
import { BookingForm } from '@/components/sections/BookingForm';

/**
 * Identical to /mommy-makeover apart from the content object it is handed.
 *
 * That is the whole point of the arrangement: a landing page is a content file
 * and a route, sharing every component, so a design fix lands on both pages at
 * once and cannot be applied to one and forgotten on the other.
 */
export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  alternates: { canonical: `/${content.slug}` },
  openGraph: {
    title: content.meta.title,
    description: content.meta.description,
    url: `/${content.slug}`,
    type: 'website',
    locale: 'en_AE',
  },
  twitter: {
    card: 'summary_large_image',
    title: content.meta.title,
    description: content.meta.description,
  },
};

export default function BreastLiftPage() {
  const jsonLd = buildJsonLd(content);

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from our own typed content, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageShell slug={content.slug} nav={content.nav} announcements={content.announcements}>
        <Hero {...content.hero} />
        <TrustStrip {...content.trust} />
        <WhatIsIt {...content.whatIsIt} />
        <Procedures {...content.procedures} />
        <Candidacy {...content.candidacy} />
        <MeetDoctor {...content.doctor} />
        <WhyTrust {...content.whyTrust} />
        <BeforeAfter {...content.results} />
        <Journey {...content.journey} />
        <Reviews {...content.reviews} />
        <Faq {...content.faq} treatment={pageTitle(content.slug)} />
        <BookingForm {...content.booking} slug={content.slug} />
      </PageShell>
    </>
  );
}
