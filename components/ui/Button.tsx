import Link from 'next/link';
import type { ReactNode, ComponentPropsWithoutRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Magnetic } from '@/components/effects/Magnetic';

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark' | 'outlineDark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] ' +
  'font-sans font-semibold tracking-[0.02em] transition-all duration-200 ' +
  'min-h-11 whitespace-nowrap select-none';

const variants: Record<Variant, string> = {
  // --gradient-fill, not --gradient-brand: every stop clears 4.5:1 against
  // white, so the label stays legible across the whole hover sweep.
  primary:
    'text-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-glow)] ' +
    'bg-[image:var(--gradient-fill)] bg-[length:200%_auto] hover:bg-right-top hover:scale-[1.03]',
  secondary:
    'text-plum-800 border border-plum-800/25 bg-white/60 backdrop-blur-sm ' +
    'hover:bg-plum-800 hover:text-white hover:border-plum-800',
  ghost:
    'text-rose-600 hover:text-plum-700 px-1 min-h-0 ' +
    'after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left ' +
    'after:scale-x-0 after:bg-[image:var(--gradient-brand)] after:transition-transform ' +
    'after:duration-300 hover:after:scale-x-100',
  onDark:
    'bg-blush-100 text-plum-900 hover:bg-white shadow-[var(--shadow-sm)] hover:scale-[1.03]',
  // Outlined counterpart to `onDark`. A real variant rather than passing
  // `bg-transparent` via className — that only overrides background-COLOR,
  // so the primary variant's background-IMAGE gradient still painted and the
  // secondary CTA rendered looking like the primary one.
  outlineDark:
    'border border-blush-100/45 bg-transparent text-blush-50 hover:bg-blush-100/12 hover:border-blush-100/70',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-5 text-sm',
  md: 'h-12 px-7 text-[0.9375rem]',
  lg: 'h-14 px-9 text-base',
};

type ButtonBaseProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Adds a chevron that slides right on hover. */
  withArrow?: boolean;
  /** Cursor-follow effect. Auto-disabled on touch and under reduced motion. */
  magnetic?: boolean;
};

function Inner({
  children,
  withArrow,
}: {
  children: ReactNode;
  withArrow?: boolean;
}) {
  return (
    <>
      {/*
        inline-flex, not a bare span: Tailwind's preflight sets `svg { display:
        block }`, so an icon passed as a child of a plain inline span pushes the
        label onto its own line.
      */}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      {withArrow && (
        <ArrowRight
          className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      )}
    </>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  withArrow,
  magnetic,
  ...rest
}: ButtonBaseProps & ComponentPropsWithoutRef<'button'>) {
  const el = (
    <button
      className={cn(base, variants[variant], variant !== 'ghost' && sizes[size], className)}
      {...rest}
    >
      <Inner withArrow={withArrow}>{children}</Inner>
    </button>
  );

  return magnetic ? <Magnetic className="inline-block">{el}</Magnetic> : el;
}

export function ButtonLink({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
  withArrow,
  magnetic,
  external,
  ...rest
}: ButtonBaseProps & {
  href: string;
  external?: boolean;
} & Omit<ComponentPropsWithoutRef<'a'>, 'href'>) {
  const classes = cn(
    base,
    variants[variant],
    variant !== 'ghost' && sizes[size],
    className,
  );

  // tel:, mailto: and wa.me links must not go through the client-side router.
  const isExternal =
    external ?? (/^(https?:|tel:|mailto:)/.test(href) && !href.startsWith('/'));

  const el = isExternal ? (
    <a
      href={href}
      className={classes}
      {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      <Inner withArrow={withArrow}>{children}</Inner>
    </a>
  ) : (
    <Link href={href} className={classes} {...rest}>
      <Inner withArrow={withArrow}>{children}</Inner>
    </Link>
  );

  return magnetic ? <Magnetic className="inline-block">{el}</Magnetic> : el;
}
