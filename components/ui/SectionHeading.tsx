import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { RevealGroup, RevealItem } from './Reveal';

type Tone = 'light' | 'dark';

type Props = {
  eyebrow?: string;
  heading: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  tone?: Tone;
  className?: string;
  headingClassName?: string;
  /** Renders the heading as an h3 for subsections. */
  as?: 'h2' | 'h3';
};

export function Eyebrow({
  children,
  tone = 'light',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-3 font-sans text-xs font-semibold uppercase leading-none tracking-[0.18em]',
        // On light backgrounds the label is plum, not gold: gold-500 on blush
        // measured 2.29:1 at 12px — well under AA, and it appeared on every
        // section. The gold now lives in the rule beside it, where it is
        // decorative and the contrast rule doesn't bite.
        tone === 'dark' ? 'text-gold-400' : 'text-plum-700',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('h-px w-6', tone === 'dark' ? 'bg-gold-400/70' : 'bg-gold-500/70')}
      />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  heading,
  lead,
  align = 'left',
  tone = 'light',
  className,
  headingClassName,
  as: Tag = 'h2',
}: Props) {
  return (
    <RevealGroup
      className={cn(
        'flex flex-col gap-5',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <RevealItem>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </RevealItem>
      )}

      <RevealItem>
        <Tag
          className={cn(
            'font-display font-semibold leading-[1.08] tracking-[-0.015em]',
            Tag === 'h2'
              ? 'text-[clamp(2rem,4.4vw,3.5rem)]'
              : 'text-[clamp(1.375rem,2.2vw,1.875rem)]',
            tone === 'dark' ? 'text-blush-50' : 'text-plum-800',
            headingClassName,
          )}
        >
          {heading}
        </Tag>
      </RevealItem>

      {lead && (
        <RevealItem>
          <p
            className={cn(
              'max-w-[52ch] text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-[1.65]',
              align === 'center' && 'mx-auto',
              tone === 'dark' ? 'text-blush-100/80' : 'text-muted',
            )}
          >
            {lead}
          </p>
        </RevealItem>
      )}
    </RevealGroup>
  );
}
