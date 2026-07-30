import Image from 'next/image';
import { Quote } from 'lucide-react';
import type { DoctorContent } from '@/content/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { AuroraBackground } from '@/components/effects/AuroraBackground';
import { scaleIn } from '@/lib/motion';

/**
 * The trust centrepiece — the second-richest moment on the page after the hero.
 *
 * Everything else is a supporting act; this is where a nervous patient decides
 * whether she trusts the surgeon. It is deliberately given more visual weight
 * than its neighbours: its own deeper blush wash, the fullest ambient layer
 * outside the hero, a layered portrait frame, and a gradient-clipped name.
 */
export function MeetDoctor(content: DoctorContent) {
  return (
    <section
      id="meet-dr-nicole"
      className="section-y relative overflow-hidden bg-[linear-gradient(180deg,var(--color-blush-50)_0%,var(--color-blush-100)_45%,var(--color-blush-50)_100%)]"
    >
      {/*
        Keeps the aurora — this is the trust centrepiece and one of only three
        places the ambient layer survives. Its petal canvas was dropped: five
        canvases across the page were a measurable share of the scroll cost,
        and the hero and closing CTA carry that effect.
      */}
      <AuroraBackground />

      <div className="container-page relative z-10 grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-18">
        {/* ---------------- Portrait ---------------- */}
        <Reveal
          variants={scaleIn}
          className="relative mx-auto w-full max-w-sm lg:max-w-none"
        >
          {/* Spotlight — lifts her off the background. */}
          <div
            aria-hidden="true"
            className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgb(232_138_171/0.42),transparent)] blur-2xl"
          />

          {/* Rotating dashed ring */}
          <div
            aria-hidden="true"
            className="anim-spin-slow absolute inset-[-7%] rounded-full border border-dashed border-gold-500/40"
          />

          {/* Offset gold outline, echoing the frame in section 3 */}
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-3 translate-y-3 rounded-[var(--radius-arch)] border border-gold-500/40"
          />

          <div className="relative aspect-4/5 overflow-hidden rounded-[var(--radius-arch)] bg-blush-100 shadow-[var(--shadow-lift)] ring-1 ring-white/70">
            <Image
              src={content.image.src}
              alt={content.image.alt}
              fill
              quality={88}
              sizes="(max-width: 1023px) 88vw, 36vw"
              className="object-cover object-top"
            />
          </div>

          {/*
            No floating credential badges over the portrait — they covered her
            and duplicated the chips already listed beside the bio. The frame
            (spotlight, rotating ring, offset gold outline) carries the emphasis
            instead.
          */}
        </Reveal>

        {/* ---------------- Copy ---------------- */}
        <div className="flex flex-col gap-7">
          <SectionHeading
            eyebrow={content.eyebrow}
            heading={content.heading}
            headingClassName="text-gradient text-[clamp(2.25rem,4.8vw,3.875rem)]"
          />

          <Reveal>
            <p className="font-display text-[clamp(1.125rem,1.6vw,1.375rem)] italic text-plum-700">
              {content.role}
            </p>
          </Reveal>

          {/*
            Her philosophy pulled out as a quote. The bio is one long paragraph;
            leading with the single line that answers "will she listen to me?"
            gives the section something to catch the eye and slows the reader
            down at the moment that matters.
          */}
          <Reveal>
            <blockquote className="relative rounded-[var(--radius-md)] border border-gold-500/30 bg-white/70 py-5 pl-14 pr-6 shadow-[var(--shadow-sm)] backdrop-blur-sm">
              <Quote
                className="absolute left-5 top-5 h-6 w-6 text-gold-500/60"
                aria-hidden="true"
              />
              <p className="font-display text-[clamp(1.0625rem,1.5vw,1.25rem)] italic leading-relaxed text-plum-800">
                {content.pullQuote}
              </p>
            </blockquote>
          </Reveal>

          <Reveal>
            <p className="max-w-[62ch] text-[1.0625rem] leading-[1.78] text-ink/80">
              {content.bio}
            </p>
          </Reveal>

          {/*
            A real signature belongs here — a gold rule stands in until a scan
            is supplied (docs/open-questions.md §14).
          */}
          <Reveal className="pt-1">
            <span className="block h-px w-40 bg-[linear-gradient(90deg,var(--color-gold-500),transparent)]" />
          </Reveal>

          <Reveal>
            <ButtonLink href={content.cta.href} size="lg" magnetic>
              {content.cta.label}
            </ButtonLink>
          </Reveal>
        </div>
      </div>

      {/*
        Credential ribbon.

        Full width beneath the grid rather than inside the text column: five
        marks squeezed into a half-width column would be too small to recognise,
        and recognition is the entire point of showing them.

        It sits directly after the bio because that is where the claim it
        substantiates is made — "international training" is otherwise something
        the reader has to take on faith.
      */}
      {content.credentials && (
        <div className="container-page relative z-10 mt-14 lg:mt-18">
          <Reveal>
            {/*
              Solid white, not a translucent wash. Three of the five marks have
              white baked into the source and are padded onto white to share a
              canvas — over a translucent card each one showed as a brighter
              rectangle against the blush behind it. An opaque card makes those
              backgrounds vanish, and drops a backdrop-blur that was costing
              compositor work for no visible gain.
            */}
            <div className="rounded-[var(--radius-lg)] border border-blush-200 bg-white px-6 py-7 shadow-[var(--shadow-sm)] sm:px-10">
              {/*
                plum-700, not gold — a muted gold on this blush wash measures
                about 2.3:1 and fails AA. Same fix as every other eyebrow on
                the page.
              */}
              <p className="text-center font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-plum-700">
                {content.credentials.label}
              </p>

              <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-7 sm:gap-x-14">
                {content.credentials.items.map((mark) => (
                  <li key={mark.src}>
                    {/*
                      Desaturated at rest, full colour on hover.

                      These five marks are red, teal, cyan and orange. Shown at
                      full strength together they fight each other and the calm
                      palette this page was built around; muted, they read as
                      one band. Opacity stays high enough that they are never
                      ambiguous — this is a credibility signal, not decoration.
                    */}
                    <Image
                      src={mark.src}
                      alt={mark.name}
                      title={mark.name}
                      width={240}
                      height={144}
                      sizes="120px"
                      className="h-16 w-auto grayscale transition-all duration-500 hover:grayscale-0 sm:h-[4.5rem]"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}
