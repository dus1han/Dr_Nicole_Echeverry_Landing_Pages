import type { Metadata } from 'next';
import { mommyMakeover as content } from '@/content/mommy-makeover';
import { buildJsonLd } from '@/lib/schema';
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
import { ConfidenceCta } from '@/components/sections/ConfidenceCta';
import { BookingForm } from '@/components/sections/BookingForm';

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

export default function MommyMakeoverPage() {
  const jsonLd = buildJsonLd(content);

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from our own typed content, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageShell nav={content.nav} announcements={content.announcements}>
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
        <Faq {...content.faq} />
        <ConfidenceCta {...content.closingCta} />
        <BookingForm {...content.booking} />
      </PageShell>
    </>
  );
}
