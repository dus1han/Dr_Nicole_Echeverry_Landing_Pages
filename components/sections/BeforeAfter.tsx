import Image from 'next/image';
import type { ResultsContent } from '@/content/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SampleRibbon } from '@/components/ui/SampleRibbon';
import { scaleIn } from '@/lib/motion';

/**
 * Before & after gallery.
 *
 * Replaces the drag-to-reveal slider: a compact side-by-side gallery shows all
 * three cases at once instead of hiding two behind tabs and requiring a drag
 * to see either half of the third. It also needs no client-side JavaScript.
 */
export function BeforeAfter(content: ResultsContent) {
  return (
    <section
      id="results"
      className="relative bg-[linear-gradient(180deg,var(--color-blush-50)_0%,var(--color-blush-100)_55%,var(--color-blush-50)_100%)] section-y"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow={content.eyebrow}
          heading={content.heading}
          lead={content.lead}
          align="center"
          className="mx-auto max-w-2xl"
        />

        {/*
          The "sample imagery" banner was removed at the client's request. The
          corner ribbons on each card and the `check:content` build gate still
          prevent placeholder imagery reaching production unnoticed.
        */}
        <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.cases.map((item) => (
            <RevealItem key={item.id} variants={scaleIn} className="h-full">
              <figure className="relative flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-blush-200 bg-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]">
                {/* A 1px gap lets the card background read as the divider. */}
                <div className="grid grid-cols-2 gap-px bg-blush-200">
                  <div className="relative aspect-3/4 overflow-hidden bg-blush-100">
                    <Image
                      src={item.before.src}
                      alt={`${item.caption} — before`}
                      fill
                      quality={80}
                      sizes="(max-width: 639px) 46vw, (max-width: 1023px) 23vw, 15vw"
                      className="object-cover"
                    />
                    <span className="absolute left-2.5 top-2.5 rounded-[var(--radius-pill)] bg-plum-900/75 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-blush-100 backdrop-blur-sm">
                      Before
                    </span>
                  </div>

                  <div className="relative aspect-3/4 overflow-hidden bg-blush-100">
                    <Image
                      src={item.after.src}
                      alt={`${item.caption} — after`}
                      fill
                      quality={80}
                      sizes="(max-width: 639px) 46vw, (max-width: 1023px) 23vw, 15vw"
                      className="object-cover"
                    />
                    <span className="absolute right-2.5 top-2.5 rounded-[var(--radius-pill)] bg-white/85 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-plum-800 backdrop-blur-sm">
                      After
                    </span>
                  </div>
                </div>

                <figcaption className="flex flex-1 flex-col gap-1 px-5 py-4">
                  <p className="font-display text-[1.0625rem] font-semibold leading-snug text-plum-800">
                    {item.caption}
                  </p>
                  <p className="font-sans text-[0.8125rem] text-muted">{item.detail}</p>
                </figcaption>

                {content.isPlaceholder && <SampleRibbon corner="bottom" />}
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>

        {/*
          The results disclaimer was removed at the client's request. The text is
          retained in the page content (`results.disclaimer`) so it can be put
          back by restoring one paragraph — see docs/open-questions.md.
        */}
        <Reveal className="mt-10 flex flex-col items-center gap-5 text-center">
          <ButtonLink href={content.cta.href} variant="secondary" size="lg" withArrow>
            {content.cta.label}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
