import type { ClosingCtaContent } from '@/content/types';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { AuroraBackground } from '@/components/effects/AuroraBackground';
import { PetalCanvas } from '@/components/effects/PetalCanvas';
import { GoldDivider } from '@/components/ui/GoldDivider';

/**
 * The emotional peak — maximum whitespace, minimum noise.
 *
 * Light, not dark. This was a deep rosewood block, but a heavy dark band at
 * the moment of highest emotional weight read as alarming rather than
 * reassuring. Warmth and air do the work instead; the section still separates
 * itself from its neighbours through a deeper blush wash and generous padding.
 *
 * No buttons: this is a statement, not an ask. The booking form follows
 * immediately below it, and the sticky nav and mobile bar carry a Book CTA
 * throughout. `primaryCta` / `secondaryCta` were removed from
 * ClosingCtaContent with them, so no dead fields remain.
 */
export function ConfidenceCta(content: ClosingCtaContent) {
  return (
    <section
      id="confidence"
      // Deepest pink on the page. With no dark bands left, this is what
      // anchors the emotional peak and stops the lower half feeling empty —
      // warmth rather than weight.
      className="grain section-y relative overflow-hidden bg-[linear-gradient(180deg,var(--color-blush-100)_0%,var(--color-blush-200)_50%,var(--color-rose-300)_100%)]"
    >
      <AuroraBackground />
      {/* Lighter than the hero so the hero stays the richest moment on the page. */}
      <PetalCanvas count={16} />

      <div className="container-page relative z-10">
        <RevealGroup className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
          <RevealItem>
            <GoldDivider className="mb-2 w-24" />
          </RevealItem>

          <RevealItem>
            <h2 className="font-display text-[clamp(2.125rem,5vw,4rem)] font-semibold leading-[1.06] tracking-[-0.015em] text-plum-800">
              {content.heading}
            </h2>
          </RevealItem>

          {content.paragraphs.map((paragraph) => (
            <RevealItem key={paragraph}>
              {/* /90, not /78 — the gradient deepens to rose-300 behind this copy. */}
              <p className="max-w-[58ch] text-[clamp(1rem,1.4vw,1.1875rem)] leading-[1.8] text-ink/90">
                {paragraph}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
