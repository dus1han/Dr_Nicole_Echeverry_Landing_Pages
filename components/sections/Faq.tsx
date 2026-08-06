'use client';

import { useState, useId } from 'react';
import { Plus } from 'lucide-react';
import type { FaqContent } from '@/content/types';
import { site, whatsappUrl } from '@/content/site';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function Faq({ treatment, ...content }: FaqContent & { treatment?: string }) {
  // null = every question collapsed on load. Nothing opens until it's clicked,
  // so the section stays compact and scannable as a list of questions.
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  // Named the first page's treatment regardless of which page rendered it, so
  // /breast-lift asked Dr. Nicole about a Mommy Makeover. The name now comes
  // from the page itself; without one the question stays general rather than
  // wrong.
  const ctaHref =
    content.footerCta.href === 'whatsapp'
      ? whatsappUrl(
          treatment
            ? `Hi, I have a question about a ${treatment} with ${site.doctor.shortName}.`
            : `Hi, I have a question for ${site.doctor.shortName}.`,
        )
      : content.footerCta.href;

  return (
    <section id="faq" className="relative bg-cream section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow={content.eyebrow}
          heading={content.heading}
          align="center"
          className="mx-auto max-w-2xl"
        />

        <RevealGroup className="mx-auto mt-10 flex max-w-3xl flex-col gap-2.5">
          {content.items.map((item, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            const buttonId = `${baseId}-button-${i}`;

            return (
              <RevealItem key={item.question}>
                <div
                  className={cn(
                    'relative overflow-hidden rounded-[var(--radius-md)] border bg-white transition-all duration-300',
                    isOpen
                      ? 'border-rose-300/60 shadow-[var(--shadow-card)]'
                      : 'border-blush-200 shadow-[var(--shadow-sm)] hover:border-rose-300/50',
                  )}
                >
                  {/* Gradient left edge grows on the open item */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-y-0 left-0 w-[3px] origin-top bg-[image:var(--gradient-brand)] transition-transform duration-400',
                      isOpen ? 'scale-y-100' : 'scale-y-0',
                    )}
                  />

                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left sm:px-7"
                    >
                      <span className="font-display text-[1.0625rem] font-semibold leading-snug text-plum-800 sm:text-xl">
                        {item.question}
                      </span>
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                          isOpen
                            ? 'rotate-[135deg] bg-[image:var(--gradient-fill)] text-white'
                            : 'bg-blush-100 text-plum-700',
                        )}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </button>
                  </h3>

                  {/*
                    A grid row animating from 0fr to 1fr — the one reliable way
                    to transition to a content-driven height without JavaScript
                    measuring it. Replaces an AnimatePresence block that shipped
                    an animation runtime to do the same job.

                    The panel stays mounted so aria-controls always points at a
                    real element; `invisible` keeps its contents out of the tab
                    order and the accessibility tree while collapsed.
                  */}
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={cn(
                      'grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-soft)]',
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                    )}
                  >
                    <div className={cn('overflow-hidden', !isOpen && 'invisible')}>
                      <p className="px-6 pb-6 text-[0.9375rem] leading-[1.78] text-muted sm:px-7">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="font-sans text-sm text-muted">{content.footerNote}</p>
          <ButtonLink href={ctaHref} variant="secondary" size="md" withArrow>
            {content.footerCta.label}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
