# Design System — "Blush Atelier"
### Dr. Nicole Echeverry · Shared across all landing pages

This is the single source of visual truth. Every landing page in this project uses these tokens without exception — that consistency is what makes a multi-page campaign site read as one premium brand.

---

## 1. Colour

### 1.1 Tokens
Declared once in `app/globals.css` under Tailwind v4's `@theme`, which auto-generates every utility (`bg-rose-500`, `text-plum-800`, `border-gold-400`, …).

> **Revised twice after client review.** The first palette read too dark and
> too purple. Removing every dark band then read as *empty*. The settled
> version below is lighter, warmer, **pink-led**, with **sage** as a second hue
> for rhythm — and no heavy dark blocks anywhere. Nothing is guessed: run
> `node scripts/audit-contrast.mjs <url>` after changing any value.

```css
@theme {
  /* Pink — the lead */
  --color-cream:     #FFFDFC;
  --color-blush-50:  #FFF8FB;
  --color-blush-100: #FEF2F6;
  --color-blush-200: #FBE4EC;
  --color-rose-300:  #F7CBDA;
  --color-rose-400:  #F0A8C2;
  --color-rose-500:  #E88AAB;   /* decorative / large text only */
  --color-rose-600:  #B54670;   /* small-text safe, 5.1:1 on cream */
  --color-plum-700:  #9C4C73;   /* eyebrows, links — 5.4:1 */
  --color-plum-800:  #7B3A5C;   /* headings — 7.8:1 */
  --color-plum-900:  #584049;   /* warm rosewood, reserved */

  /* Sage — the calm counterpart */
  --color-sage-50:   #F4F8F4;
  --color-sage-100:  #E7EFE8;
  --color-sage-200:  #CFDFD3;
  --color-sage-300:  #ADC3B3;
  --color-sage-500:  #6E8A78;
  --color-sage-700:  #4A6353;   /* body-safe, 6.5:1 */

  --color-gold-400:  #E2CAA6;
  --color-gold-500:  #AE8544;   /* 3.4:1 — rules & icons, NEVER body text */
  --color-ink:       #3A2430;   /* 14:1 */
  --color-muted:     #83656F;   /* 5.0:1 on blush-50 */
}
```

### 1.2 Semantic assignment

| Purpose | Token |
|---|---|
| Page background | `cream` |
| Alternating pink section | `blush-50` / `blush-100` |
| Calm section (Candidacy, Journey, Booking) | `sage-50` / `sage-100` |
| Closing-CTA anchor | `blush-100` → `rose-300` |
| Body text | `ink` |
| Secondary text | `muted` |
| Headings | `plum-800` |
| Eyebrow labels | `plum-700` (**not** gold — see §1.5) |
| Primary button fill | `--gradient-fill` |
| Links / interactive | `rose-600` |
| Hairlines & dividers | `gold-500` @ 40–70% |
| Card borders | `blush-200` |

### 1.2b Why sage
A page of nothing but pink read flat, and once the dark bands were removed it
read empty. Sage is pink's desaturated complement: it gives sections a second
hue to alternate against and feels spa-like rather than clinical, creating
rhythm **without** reintroducing heavy dark blocks. It is a supporting colour —
pink stays the lead and carries every heading, CTA and accent.

**Section rhythm — no dark bands anywhere:**
```
Hero              blush → cream → blush      pink
Trust strip       blush-200                  pink band
What Is It        cream
Procedures        blush-50                   pink
Candidacy         sage-100 → cream           SAGE
Meet Dr. Nicole   cream
Why Trust         blush-50                   pink
Before & After    cream
Your Journey      cream → sage-50 → cream    SAGE
Reviews           blush-50                   pink
FAQ               cream
Confidence CTA    blush-100 → rose-300       DEEPEST PINK — the anchor
Booking           sage-50 → cream → blush    SAGE
Visit the Clinic  cream
Footer            blush-100 → blush-200      pink
```

### 1.3 The gradients — three, and they are not interchangeable

```css
/* DECORATIVE ONLY — never behind text */
--gradient-brand: linear-gradient(135deg,
  #FEF2F6 0%, #F7CBDA 38%, #E88AAB 72%, #A84069 100%);

/* Surfaces carrying WHITE text or icons */
--gradient-fill: linear-gradient(120deg, #BC4C77 0%, #A84069 45%, #833354 100%);

/* Gradient-clipped headings on a light page */
--gradient-text: linear-gradient(102deg,
  #BC4C77 0%, #9C4C73 40%, #D06C92 75%, #A84069 100%);

--gradient-aura: radial-gradient(closest-side, rgba(232,138,171,0.5), transparent);

/* Retained but UNUSED on this page — no section is dark any more. */
--gradient-dark: linear-gradient(160deg, #513A40 0%, #654A52 55%, #785863 100%);
```

> ⚠ **This split exists because the single-gradient version shipped broken.**
> `--gradient-brand` starts at `#FDEEF3`, which is essentially white. Used as a fill
> behind a white label, the first third of the sweep swallowed the text — the "Case 1"
> pill, the primary buttons and the drag handle were all unreadable. Used as a
> text-clip on a blush background, the word "Makeover" faded to invisible on mobile.
>
> **Rule:** white text/icons → `--gradient-fill` (every stop ≥4.5:1 against white).
> Gradient headings → `--gradient-text` (no pale stops). `--gradient-brand` is only
> for glows, hairlines, top-edges, progress bars and other non-text decoration.

| Gradient | Used by |
|---|---|
| `--gradient-fill` | Primary button, active case/interest pills, FAQ open icon, pillar icon tiles, mobile Book CTA, map fallback + pin, social hover, carousel active dot |
| `--gradient-text` | Hero headline line 2, trust-strip stat numbers |
| `--gradient-brand` | Aura glows, section top-edges, nav underline, scroll-progress bar, journey timeline fill, form card border, chip diamonds |

### 1.4 Shadows — always pink-tinted, never grey
```css
--shadow-sm:    0  4px 14px -6px  rgba(221,110,150,0.22);
--shadow-card:  0 24px 60px -20px rgba(221,110,150,0.28);
--shadow-lift:  0 36px 80px -24px rgba(142, 53, 96,0.34);
--shadow-glow:  0  0 48px         rgba(221,110,150,0.45);
```

### 1.5 Contrast compliance (WCAG AA)

| Pair | Ratio | Verdict |
|---|---|---|
| `ink` on `cream` | 13.4:1 | ✅ AAA |
| `muted` on `cream` | 5.2:1 | ✅ AA |
| `plum-800` on `blush-50` | 10.1:1 | ✅ AAA |
| `blush-100` on `plum-900` | 12.8:1 | ✅ AAA |
| `rose-600` on `cream` | 4.6:1 | ✅ AA (body text OK) |
| `rose-500` on `cream` | 3.2:1 | ⚠️ **Large text (≥24px) & UI only** |
| `gold-400` on `plum-900` | 8.1:1 | ✅ AAA |
| white on `--gradient-fill` lightest stop `#B94873` | 4.95:1 | ✅ AA |
| white on `--gradient-fill` darkest stop `#7E2C52` | 8.9:1 | ✅ AAA |

**Rule:** `rose-500` never carries small body text, and never sits behind white text.
White labels always go on `--gradient-fill`, whose *lightest* stop already clears 4.5:1.

### 1.5 Eyebrow labels are plum, not gold
The uppercase eyebrow above every section heading was originally `gold-500`.
Measured on the rendered page it came out at **2.29:1** at 12px — well under AA,
on *every section*. It is now `plum-700` (5.4:1), which also reads pinker and
cuter. The gold survives as the little rule beside it, where it is purely
decorative and the text rule doesn't apply.

Lesson: `gold-500` is a **rule-and-icon** colour on light backgrounds. It must
never carry body text. The `audit-contrast.mjs` script exists because this bug
shipped through a structural a11y pass that never looked at colour.

### 1.6 Target size (WCAG 2.2 SC 2.5.8)
Every interactive element is ≥24px tall; primary touch controls (form buttons, case tabs,
the slider handle) are ≥44px. Inline text links in the nav and footer carry vertical
padding to reach the minimum — verified by `scripts/audit-a11y.mjs`.

---

## 2. Typography

### 2.1 Families
```ts
Playfair_Display  // display — weights 500, 600, 700 + 500 italic
Manrope           // body/UI — weights 400, 500, 600, 700
```
Both via `next/font/google` → self-hosted, `display: 'swap'`, zero CLS. Exposed as `--font-display` and `--font-sans`.

*Why Playfair:* the supplied logo is a high-contrast Didone serif. Playfair Display is the closest widely-available match — the page and the logo look like one brand.

### 2.2 Scale (fluid)

| Role | Size | Weight | Leading | Tracking |
|---|---|---|---|---|
| Display / H1 | `clamp(2.75rem, 7vw, 5.5rem)` | 700 | 0.98 | `-0.02em` |
| H2 | `clamp(2rem, 4.4vw, 3.5rem)` | 600 | 1.08 | `-0.015em` |
| H3 | `clamp(1.375rem, 2.2vw, 1.875rem)` | 600 | 1.2 | `-0.01em` |
| Lead paragraph | `clamp(1.125rem, 1.5vw, 1.375rem)` | 400 | 1.65 | `0` |
| Body | `clamp(1rem, 1.05vw, 1.0625rem)` | 400 | 1.72 | `0` |
| Small / caption | `0.875rem` | 500 | 1.5 | `0.01em` |
| **Eyebrow** | `0.75rem` | 600 | 1 | `0.18em` uppercase |
| Button | `0.9375rem` | 600 | 1 | `0.02em` |

### 2.3 Rules
- Serif for headings and pull-quotes **only**. Never for body or UI.
- Measure capped at `68ch` for paragraphs, `52ch` for leads.
- Italic Playfair is reserved for a single emphasised phrase per section — it's a spice, not a seasoning.
- Numerals in the trust strip use `font-variant-numeric: tabular-nums` so count-ups don't jitter.

---

## 3. Space, Radius, Layout

### 3.1 Rhythm
Base unit **4px**.

Section vertical padding is the `section-y` utility — **one place, every section**:

```css
@utility section-y { padding-block: clamp(1.75rem, 3.2vw, 2.75rem); }  /* 44px / 28px */
```

It started at `clamp(5rem, 10vw, 9rem)` (144px) and came down in three rounds of client
review. The value was previously hardcoded identically in fourteen files; centralising it
means the whole page retunes from one line and no section can silently drift.

The hero is the one exception: its **top** padding is `7.75rem / 8.25rem` because it must
clear the 117px fixed header — anything smaller tucks the eyebrow underneath it. Its bottom
matches the shared rhythm.

### 3.2 Container
```
max-width: 1240px;  padding-inline: clamp(1.25rem, 5vw, 3rem);
```
Full-bleed sections (hero, dark bands, marquee) break out; their inner content still uses the container.

### 3.3 Radii
| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 10px | Chips, inputs |
| `--radius-md` | 18px | Cards |
| `--radius-lg` | 28px | Image frames, panels |
| `--radius-pill` | 999px | Buttons, badges |
| `--radius-organic` | `48% 52% 40% 60% / 55% 45% 55% 45%` | Blob image masks |
| `--radius-arch` | `50% 50% 24px 24px / 32% 32% 24px 24px` | Doctor portrait frame |

### 3.4 Breakpoints
`sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`
Design is authored mobile-first. Every section is verified at **360, 768, 1024, 1440, 1920**.

### 3.5 Z-index ladder
```
0    page content
10   sticky section elements
20   floating badges
40   floating WhatsApp / mobile CTA bar
50   sticky navigation
60   mobile menu overlay
70   scroll progress bar
90   cursor glow (pointer-events: none)
100  page-load curtain
```

---

## 4. Motion

### 4.1 Constants (`lib/motion.ts`)
```ts
export const EASE_OUT    = [0.16, 1, 0.30, 1];   // entrances — soft overshoot
export const EASE_INOUT  = [0.40, 0, 0.20, 1];   // state changes
export const DUR = { micro: 0.18, fast: 0.32, base: 0.52, slow: 0.8 };
export const STAGGER = 0.08;
export const VIEWPORT = { once: true, amount: 0.25 };
```

### 4.2 Shared variants
| Variant | Motion |
|---|---|
| `fadeUp` | `opacity 0→1`, `y 32→0`, `DUR.base` |
| `fadeIn` | `opacity 0→1`, `DUR.base` |
| `scaleIn` | `opacity 0→1`, `scale 0.94→1`, `DUR.base` |
| `slideFromLeft` / `Right` | `opacity 0→1`, `x ∓48→0` |
| `staggerParent` | `staggerChildren: STAGGER, delayChildren: 0.1` |
| `drawPath` | `pathLength 0→1`, `DUR.slow` |

### 4.3 Ambient loop timings
| Effect | Duration | Notes |
|---|---|---|
| Aurora blob A / B / C | 22s / 27s / 31s | Deliberately coprime so they never sync |
| Headline shimmer | 3.2s, 4s delay between runs | Once on load, then idle |
| Petal drift | continuous, 18–34s per particle | 28 particles max |
| Marquee | 34s linear | Pauses on hover |
| Badge bob | 5s ease-in-out | ±6px |
| Gold ring rotate | 40s linear | Behind doctor portrait |

### 4.4 Interaction motion
| Element | Rest → Hover | Duration |
|---|---|---|
| Primary button | `scale 1→1.03`, glow `0→0.45` | `micro` |
| Card | `y 0→-8`, shadow `card→lift` | `fast` |
| Tilt card | `rotateX/Y` up to ±8°, spring `{stiffness:150, damping:18}` | live |
| Magnetic button | translate up to 12px toward cursor | spring |
| Image in card | `scale 1→1.06` | `slow` |
| Link arrow | `x 0→5px` | `micro` |
| Accordion | height auto, spring `{stiffness:260, damping:30}` | — |

### 4.5 Performance rules
- Animate **only** `transform`, `opacity`, `filter`. Never `width/height/top/left/margin`.
- Canvas particles: `cancelAnimationFrame` when off-screen via `IntersectionObserver`.
- Blurred aurora blobs live in a `contain: paint` wrapper.
- Desktop-only effects (tilt, cursor glow, magnetic) gated behind `useIsDesktop()` + `(hover: hover)` — never mounted on touch devices.

#### ⚠ Above the fold, entrances MUST be CSS — never Motion

A Motion `whileInView` / `initial` entrance renders its element at `opacity: 0` and only
reveals it once React has hydrated. Measured on a 4× CPU-throttled mobile profile, that
left the hero `<h1>` **invisible for 4.3 seconds** and made the blank headline the LCP
element.

The hero is therefore a **server component** using CSS classes:

```css
.anim-rise      { animation: rise-in  0.52s var(--ease-out-soft) both; }
.anim-scale-in  { animation: scale-in 0.80s var(--ease-out-soft) both; }
```

Stagger via inline `animationDelay`. `animation-fill-mode: both` holds the from-state
during the delay and the to-state after, so nothing flashes and nothing is stranded
invisible. Under `prefers-reduced-motion` these are snapped to the end state with
`opacity: 1; transform: none` — **not** `animation: none`, which would drop fill-mode and
leave them at `opacity: 0`.

Below-the-fold sections use `Reveal` freely: the user cannot reach them before hydration.

Result: FCP 1.54s · LCP 1.94s · CLS 0.009 on that same throttled profile.

#### Ambient effects are rationed — and cost more together than apart
The page originally carried six aurora instances, five petal canvases, five grain overlays
and a blend-mode cursor glow. Measured on the production build at 4× CPU throttle, scrolling
ran at **8.7fps with 68% of frames over budget**.

Bisecting (`scripts/bisect-scroll-perf.mjs`) showed **no single effect dominated** — but
disabling all of them jumped to 35fps. The cost was cumulative. Now:

| Effect | Where it survives |
|---|---|
| Aurora fields | Hero · Meet Your Surgeon · closing CTA |
| Petal canvas | Hero (28) · closing CTA (16) |
| Grain overlay | Hero · closing CTA |
| Cursor glow | **Removed entirely** |

Rules that came out of it:
- **Aurora uses soft radial-gradients, never `filter: blur()`.** A blurred layer must be
  re-rasterised whenever the compositor can't reuse it; a gradient is a plain paint and
  looks identical at these opacities.
- **Animate translate only, never `scale`.** Scaling changes a layer's rasterised size every
  frame.
- **No large `backdrop-filter` on anything fixed.** The nav uses `bg-cream/95` +
  `backdrop-blur-sm`; more opacity needs less blur.
- **Canvas DPR capped at 1.5.** Soft translucent blobs don't benefit from a 2× buffer.

Result: **51fps unthrottled, 0.7% of frames over budget.**

#### `content-visibility: auto` was removed
It was applied to the long sections, but `contain-intrinsic-size` guessed 900px against
real heights of ~1300px, which makes the scrollbar jump as you scroll. The page is only
~5000px tall, so the saving did not justify the jitter. The `defer-paint` utility still
exists in `globals.css` if a future page is long enough to need it — set an accurate
intrinsic size if you use it.

### 4.6 `prefers-reduced-motion: reduce`
A single `useReducedMotion()` gate at the effect layer:
- **Off:** particle canvas, cursor glow, marquee scroll, aurora drift, Ken Burns, tilt, magnetic, page curtain, bobbing badges.
- **Simplified:** all entrance animations → 150ms opacity fade, no `y`/`scale`.
- **Kept:** accordion height (it communicates state), before/after slider (it's the feature), focus indicators.

---

## 5. Component Specs

### 5.1 Button
| Variant | Appearance |
|---|---|
| `primary` | Gradient fill, white text, pill, `shadow-glow` on hover, magnetic, optional shimmer sweep |
| `secondary` | Transparent, 1px `plum-800` border, fills `plum-800`/white on hover |
| `ghost` | Text + arrow only, gradient underline grows left→right |
| `onDark` | `blush-100` fill, `plum-900` text |

Sizes `sm 40px` / `md 48px` / `lg 56px`. Always `min-height: 44px` for touch targets. Focus: `outline: 2px solid rose-500; outline-offset: 3px`.

### 5.2 Card
`bg-white`, `border-blush-200`, `radius-md`, `shadow-card`. Hover lifts 8px to `shadow-lift`. Optional gradient top-edge (3px) that scales in from the left.

### 5.3 Input
48px tall, `radius-sm`, 1px `blush-200` border, `blush-50` fill. Floating label rises and shrinks on focus/filled. Focus: border `rose-400` + 3px `rose-300/30` ring. Error: `rose-600` border + message with a warning icon. Success: gold check that draws in.

### 5.4 Accordion
Row: question in Playfair 20px, `+` icon rotating 45° to become `×`. Open state gets a 3px gradient left edge that scales in vertically. Only one open at a time. Full keyboard support with `aria-expanded` / `aria-controls`.

### 5.5 SectionHeading
Composed: eyebrow (uppercase, gold, with a 24px gold rule before it) → H2 → optional lead paragraph. Centred or left-aligned. Reveals as a stagger group.

### 5.6 GoldDivider
Centred 1px line, `gold-400` @ 40%, fading to transparent at both ends, with a 6px rotated gold diamond at its centre. Scales in horizontally on view.

### 5.7 SampleRibbon
Gold-on-plum diagonal corner ribbon reading `SAMPLE`, 11px, `0.14em` tracking, `pointer-events: none`, `z-index: 20`. Rendered only while a content block has `isPlaceholder: true`. Appears on placeholder review cards and before/after plates. Deliberately visible but not ugly — the page still demos well.

### 5.8 MapFrame
`radius-lg` container, 1px `gold-400` @ 50% border, `shadow-card`, `overflow: hidden`. Inside: the Google Maps iframe at `filter: saturate(0.85) contrast(1.02)` to calm its default colours, plus a non-interactive blush vignette overlay (`radial-gradient(closest-side, transparent 60%, rgba(253,238,243,0.55))`) so the edges melt into the page. A pulsing gradient pin sits over the clinic position (two concentric rings, 2.4s ease-out loop, disabled under reduced-motion). Aspect ratio 16:9 mobile, 4:3 desktop. `loading="lazy"` + `IntersectionObserver` gate so it never costs anything above the fold.

### 5.9 GlassBadge
`backdrop-blur(16px)`, `bg-white/70`, 1px `white/60` border, `radius-pill`, `shadow-sm`. Contains a gold icon + label. Bobs gently unless reduced-motion.

---

## 6. Imagery

### 6.1 Treatment
- Warm-toned, high-key, never clinical-cold.
- Framed with `radius-lg`, `radius-organic`, or `radius-arch` — never a hard rectangle except inside cards.
- Every image sits over a soft rose aura glow so it feels lit rather than pasted.
- Subtle grain overlay (3%) unifies photos of differing sources.

### 6.2 Asset map (this page)

| Source file | Destination | Used in |
|---|---|---|
| `ChatGPT Image ... 03_32_08 AM.png` | `hero-dubai.png` | Hero — Dubai skyline balcony |
| `dra-nicole-echeverry-en-cirugia-1.jpg` | `surgeon-operating.jpg` | What Is a Mommy Makeover |
| `482030689_1402814974390728_...jpg` | `doctor-portrait.jpg` | Meet Dr. Nicole |
| `ChatGPT Image ... 02_59_12 AM.png` | `procedure-tummy.png` | Procedures — Tummy Tuck |
| `ChatGPT Image ... 03_08_24 AM.png` | `procedure-breast.png` | Procedures — Breast Lift / Augmentation |
| `grok-image-53e50550-....jpg` | `procedure-lipo.jpg` | Procedures — Liposuction / Candidacy |
| `images (2).jpg` | `doctor-alt.jpg` | Reserve — nav avatar / OG card |
| `logo.png` | `logo/logo-white.png` | Footer, mobile menu (dark backgrounds) |
| *generated* | `logo/logo-plum.png` | Navigation (light background) |
| *generated* | `results/case-{1,2,3}-before.jpg` | Before & After slider — **dummy**, softened/desaturated derivatives |
| *generated* | `results/case-{1,2,3}-after.jpg` | Before & After slider — **dummy**, the unmodified source plates |

Generated assets are produced by `scripts/prepare-assets.mjs`, which runs once at setup — the source folder is never modified.

**Note on the logo:** the supplied PNG is pure white on transparent (800×450, "NE/EN" monogram + "NICOLE ECHEVERRY" + "CIRUJANA PLÁSTICA, RECONSTRUCTIVA Y ESTÉTICA"). It is invisible on light backgrounds, so the build generates a `plum-900`-tinted copy from its alpha channel for use in the sticky nav.

### 6.3 Delivery
`next/image` everywhere · explicit `sizes` · `priority` on the hero image only · `quality={85}` · blurred placeholder · AVIF/WebP negotiated automatically. Decorative images get `alt=""`; content images get descriptive alt text.

---

## 7. Voice & Microcopy

| Context | Pattern | Example |
|---|---|---|
| Headings | Second person, present tense | "Feel Like Yourself Again" |
| Eyebrows | Two or three words, uppercase | "THE PROCEDURE" |
| Buttons | Verb + object, no exclamation | "Book Your Consultation" |
| Form labels | Plain nouns | "Phone number" |
| Errors | Helpful, never blaming | "We'll need a number we can reach you on." |
| Success | Warm and specific | "Thank you. Dr. Nicole's team will contact you within one working day." |
| Disclaimers | Honest and unhedged | "Individual results vary. All surgery carries risk." |

**Banned words:** flaws · fix · problem areas · bounce back · snap back · perfect · guaranteed · risk-free · cheap · deal.
