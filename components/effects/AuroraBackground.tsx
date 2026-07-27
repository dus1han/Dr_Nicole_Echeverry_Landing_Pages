import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  tone?: 'light' | 'dark';
  /** Softer, smaller fields for narrower sections. */
  intensity?: 'full' | 'subtle';
};

/**
 * Drifting colour fields.
 *
 * NO `filter: blur()`.
 *
 * These were blurred divs, which is the obvious way to build them and also the
 * expensive one: a blurred layer has to be re-rasterised whenever the
 * compositor can't reuse it, and nine of them across the page dominated the
 * scroll cost (measured: removing them alone was worth ~9fps).
 *
 * A radial-gradient with a soft falloff is visually indistinguishable at these
 * opacities and is just a paint — no filter, no separate blur pass. Animation
 * is translate-only so the compositor can cache each layer and simply move it.
 */

const FIELDS = {
  light: ['247,203,218', '240,168,194', '226,202,166'],
  dark: ['145,69,105', '232,138,171', '226,202,166'],
} as const;

const ALPHA = {
  full: [0.34, 0.24, 0.2],
  subtle: [0.22, 0.16, 0.13],
} as const;

export function AuroraBackground({ className, tone = 'light', intensity = 'full' }: Props) {
  const size = intensity === 'full' ? 'h-[42rem] w-[42rem]' : 'h-[28rem] w-[28rem]';
  const rgb = FIELDS[tone];
  const alpha = ALPHA[intensity];

  const field = (i: number) =>
    `radial-gradient(circle, rgba(${rgb[i]},${alpha[i]}) 0%, rgba(${rgb[i]},${
      alpha[i] * 0.45
    }) 38%, rgba(${rgb[i]},0) 70%)`;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden [contain:paint]',
        className,
      )}
    >
      <div
        className={cn('anim-aura-a absolute -left-[15%] -top-[25%] rounded-full', size)}
        style={{ backgroundImage: field(0) }}
      />
      <div
        className={cn('anim-aura-b absolute -right-[18%] top-[8%] rounded-full', size)}
        style={{ backgroundImage: field(1) }}
      />
      <div
        className={cn('anim-aura-c absolute bottom-[-30%] left-[25%] rounded-full', size)}
        style={{ backgroundImage: field(2) }}
      />
    </div>
  );
}
