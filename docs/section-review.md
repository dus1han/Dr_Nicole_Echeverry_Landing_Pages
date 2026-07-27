# Section-by-Section Review Log

A running record of the client review pass over `/mommy-makeover`, one section at a
time. Each entry records what was requested, what changed, anything found along the way,
and how it was verified.

**Process per section**
1. Capture the section as-is (`node scripts/shoot-sections.mjs <url> <out> <width>`).
2. Apply the requested changes.
3. Re-capture at 390 / 1440 and compare.
4. Log it here, including anything found that wasn't asked for.

---

## 0 · Palette — ✅ Revised (page-wide)

Three rounds of client feedback, applied across every section.

| Feedback | Response |
|---|---|
| "pink is good but a bit too dark" | Lightened the whole scale: backgrounds nearer white, headings `#5E2340` → `#7B3A5C`, body `#2B1620` → `#3A2430`, softer diffuse shadows. |
| "check the purple colour" | The dark tone had far more blue than green, which reads as purple. Rebalanced to a warm rosewood. |
| "the dark colour is too panicking, no calm" | **Removed every dark band.** Candidacy, the closing CTA, the footer, the top marquee and the mobile menu are all light now. |
| "but now it feels empty, maintain balance" | Added tonal anchors: a `blush-200` trust band and a `rose-300` closing-CTA that grounds the lower half — warmth instead of weight. |
| "pink can be mixed with other colours" | Introduced **sage** as a second hue (Candidacy, Journey, Booking). Pink stays the lead and carries every heading, CTA and accent. |

### Bugs found while doing it
1. **Eyebrow labels failed AA on every section** — `gold-500` on blush measured
   **2.29:1** at 12px. Changed to `plum-700` (5.4:1), which also reads cuter.
2. **Required-field asterisk** `rose-500` at 3.11:1 → `rose-600` (5.1:1).
3. **Closing-CTA secondary button rendered as a primary.** It set
   `bg-transparent` via className, which only overrides background-*color* —
   the primary variant's background-*image* gradient still painted, inverting
   the CTA hierarchy. Fixed with a real `outlineDark` variant.

### New tooling
[`scripts/audit-contrast.mjs`](../scripts/audit-contrast.mjs) — walks every text
node on the rendered page, resolves its true backdrop (including per-stop across
gradients) and checks the AA threshold for its size. The structural a11y audit
never looked at colour, which is how the eyebrow bug survived. It is now part of
the check routine.

**Result:** every measurable text/background pair passes AA at 390px and 1440px.

---

**Review order**

| # | Section | Anchor | Status |
|---|---|---|---|
| 1 | Hero | *(top)* | ✅ Reviewed |
| 2 | Trust strip | — | ✅ Reviewed |
| 3 | What is a Mommy Makeover | `#what-is-it` | ✅ Reviewed |
| 4 | The Procedures | `#procedures` | ✅ Reviewed |
| 5 | Am I the right candidate? | `#candidacy` | ✅ Reviewed |
| 6 | Meet Dr. Nicole | `#meet-dr-nicole` | ✅ Reviewed |
| 7 | Why Trust Dr. Nicole | `#why-trust` | ✅ Reviewed |
| 8 | Before & After | `#results` | ✅ Reviewed |
| 9 | Your Journey | `#journey` | ✅ Reviewed |
| 10 | Patient Reviews | `#reviews` | ✅ Reviewed |
| 11 | FAQ | `#faq` | ✅ Reviewed |
| 12 | Your Confidence Deserves Your Attention | `#confidence` | ✅ Reviewed |
| 13 | Booking form | `#book` | ✅ Reviewed |
| 14 | Visit the Clinic | `#location` | 🗑️ Removed |
| 15 | Footer + persistent CTAs | — | ✅ Reviewed |
| — | **Page-wide spacing pass** | — | ✅ Done |

---

## 1 · Hero — ✅ Reviewed

**File:** [`components/sections/Hero.tsx`](../components/sections/Hero.tsx)

### Requested
1. Remove the two items listed under the *Book Your Consultation* button —
   "Colombian-trained surgeon" and "Tailored to your anatomy".
2. Remove the "DISCOVER" label and its down-arrow.
3. Reduce the empty space at the top and bottom of the section.

### Applied
| Change | Detail |
|---|---|
| Removed the badge list under the CTAs | The `<ul>` of `content.hero.badges`. The same two strings still appear as the floating glass badges over the hero image, so nothing is lost — they were being shown twice. |
| Removed the scroll cue | The "DISCOVER" link and its bouncing chevron, plus `content.hero.scrollCue` from the content file and `HeroContent` type. |
| Tightened vertical padding | Bottom: `pb-16 / lg:pb-20` → `pb-10 / lg:pb-14` (64→40px, 80→56px). Top: `lg:pt-36` → `lg:pt-[8.25rem]` (144→132px). |
| **Fixed a collision found while measuring** | Mobile top padding was `pt-28` (112px) against a 117px-tall fixed header — the eyebrow sat 5px *underneath* the header. Raised to `pt-[7.75rem]` (124px). Reducing it further, as the brief asked, would have deepened a real bug; it is now 7px clear. |

### Net effect on section height
Measured with `scripts/measure-box.mjs`, not estimated.

| Viewport | Before | After | Saved |
|---|---|---|---|
| 1440px | 972px | **761px** | −211px (−22%) |
| 390px | 1175px | **1071px** | −104px (−9%) |

Top clearance below the 117px header: 132px desktop / 124px mobile.

### ⚠ Raised for a decision — mobile now shows neither badge
The floating glass badges over the hero image are `hidden sm:block`, i.e. **they only
render at ≥640px**. With the list under the CTAs removed, "Colombian-trained surgeon" and
"Tailored to your anatomy" no longer appear anywhere in the hero on a phone.

Left as requested, because the intent was a cleaner hero and re-adding them on mobile
would put the clutter back. Both claims still appear in *Meet Dr. Nicole*. If you'd
rather phones kept them, it is a one-word change (`hidden sm:block` → `block`) — say the
word.

### Notes
- `scrollCue` was removed from `content/types.ts` and the content file too, so the
  compiler will flag any future landing page that still supplies it. No dead data left.
- The trust strip now sits partly within the initial 1440×900 viewport. Its count-up
  still fires correctly (triggers at 50% visibility).

### Verified
- Re-captured at 390 / 1440 — hero fits above the fold on desktop with both CTAs visible.
- Eyebrow clears the fixed header at both widths.
- `npm run typecheck` clean.

---

## 2 · Trust strip — ✅ Reviewed

**File:** [`components/sections/TrustStrip.tsx`](../components/sections/TrustStrip.tsx)

### Requested
Reduce the white space above and below the four statistics.

*(The "10+ / Years of surgical experience" line in the brief was naming the section, not
requesting a content change — confirmed with the client. All four stats stay as they are.)*

### Applied
| Change | Before | After |
|---|---|---|
| Vertical padding | `py-12 sm:py-14` (48 / 56px) | `py-7 sm:py-8` (28 / 32px) |
| Row gap (wrapped 2×2 on mobile) | `gap-y-10` (40px) | `gap-y-8` (32px) |

### Net effect on section height

| Viewport | Before | After | Saved |
|---|---|---|---|
| 1440px | 208px | **160px** | −48px (−23%) |
| 390px | 273px | **225px** | −48px (−18%) |

### Notes
- The strip now sits partly inside the initial 1440×900 viewport. The count-up still
  fires correctly — it triggers at 50% visibility, and the captures confirm the numbers
  reach their final values.
- The four figures remain **placeholders** (`isPlaceholder: true`), so the build gate
  still blocks release until real ones are supplied. See
  [`open-questions.md`](open-questions.md) §6.

### Verified
- Re-captured at 390 / 1440; the `border-y` hairlines still read cleanly at the tighter
  spacing, and the two-column mobile layout is unchanged.

---

## 3 · What is a Mommy Makeover? — ✅ Reviewed

**File:** [`components/sections/WhatIsIt.tsx`](../components/sections/WhatIsIt.tsx)

### Requested
Reduce the empty space at the top and bottom — it read as much airier than the hero and
trust strip above it. *(Compare upward only; sections below are reviewed in their turn.)*

### Applied
| Change | Before | After |
|---|---|---|
| Section padding | `section-y` → 144px | `clamp(2.5rem,5vw,4.5rem)` → **72px** |
| Column gap | `gap-14 lg:gap-20` (56 / 80px) | `gap-12 lg:gap-16` (48 / 64px) |

**Section height: 953px → 819px (−134px, −14%).**

### Rhythm at the top of the page now

| Section | Top | Bottom |
|---|---|---|
| Hero | 132px | 56px |
| Trust strip | 28px | 32px |
| **What is a Mommy Makeover** | **72px** | **72px** |
| *(Procedures and below — still 144px, pending review)* | | |

### Also applied — visible background tint, and ambient motion
| Change | Detail |
|---|---|
| Backgrounds deepened **page-wide** | The base scale sat within 1–2% of pure white, so sections had no visible identity. `cream` `#FFFDFC`→`#FEFAF8`, `blush-50`→`#FDF2F7`, `blush-100`→`#FAE7EF`, `blush-200`→`#F5D9E5`, sage deepened to match. |
| Text re-tuned for the deeper bands | `plum-700`→`#914569` and `muted`→`#7A5A65`, so both still clear 4.5:1 on the *deepest* band rather than only on near-white. Verified, not assumed. |
| Ambient layer added | Subtle aurora + 11 drifting petals + grain — the hero's effects at roughly 40% strength. |

A colour-shifting background gradient was tried and **removed** at the client's request.

### Motion budget across the page
Deliberately tiered so the hero stays the richest moment:

| Section | Ambient motion |
|---|---|
| Hero | aurora + **28** petals + grain + Ken Burns |
| What is a Mommy Makeover | aurora (subtle) + **11** petals + grain |
| Confidence CTA | aurora + **16** petals + grain |
| Candidacy · Booking | aurora (subtle) only |
| Everything else | **still** — no ambient motion |

Rationale in the response for this section: repeating the hero effect everywhere makes it
read as wallpaper, competes with the sections that need focus (FAQ, booking, before/after),
and works against the calm the palette was rebuilt for.

### Note
`measure-gaps.mjs` reports a `gapTop` of −13px for this section. That is the parallax
image's `inset-[-6%]` layout box, which extends past its `overflow-hidden` frame and is
clipped visually. Not a real overflow — no visual change.

### Verified
- Re-captured at 1440; the offset gold frame still clears the section edge.
- Contrast and a11y audits still passing.

---

## 4 · The Procedures — ✅ Reviewed

**Files:** [`components/sections/Procedures.tsx`](../components/sections/Procedures.tsx) ·
[`components/effects/TiltCard.tsx`](../components/effects/TiltCard.tsx)

### Requested
Reduce the top and bottom spacing to match the sections above.

### Applied
| Change | Before | After |
|---|---|---|
| Section padding | `section-y` → 144px | `clamp(2.5rem,5vw,4.5rem)` → **72px** (identical to §3) |
| Heading → cards | `mt-16` (64px) | `mt-10` (40px) |
| Card grid gap | `gap-7` (28px) | `gap-6` (24px) |
| Cards → gold divider | `mt-20` (80px) | `mt-12` (48px) |
| Divider → closing CTA | `mt-10` (40px) | `mt-7` (28px) |
| CTA block internal gap | `gap-6` | `gap-5` |

Internal gaps were trimmed as well as the padding: this section is centre-aligned, so the
same padding that reads as comfortable beside a two-column layout reads as airy here.

**Section height: 1524px → 1310px (−214px, −14%).**

### Rhythm at the top of the page

| Section | Top | Bottom |
|---|---|---|
| Hero | 132px | 56px |
| Trust strip | 28px | 32px |
| What is a Mommy Makeover | 72px | 72px |
| **The Procedures** | **72px** | **72px** |
| *(Candidacy and below — still 144px, pending review)* | | |

### 🐛 Bug fixed — cards were not equal height
The three procedure cards had different bottom edges. The height chain
(`grid` → `RevealItem h-full` → `TiltCard` → `article h-full`) was broken by `TiltCard`'s
perspective wrapper, which had no `h-full` of its own, so each card collapsed to its own
content height. Added `h-full` to the wrapper — the cards now align and the benefit lists
sit on a common baseline.

This affected **every** page using `TiltCard`, not just this section.

### Verified
- Re-captured at 1440; card bottoms confirmed level and benefit lists on a common baseline.
- Typecheck clean; contrast and a11y audits still passing.

---

## 5 · Am I the right candidate? — ✅ Reviewed

**File:** [`components/sections/Candidacy.tsx`](../components/sections/Candidacy.tsx)

### Requested
1. Fix the top and bottom spacing.
2. The closing quote and its button sat in the left column with the right side empty —
   redesign so the block covers the full width.
3. Add ambient animation where it's warranted.

### Applied
| Change | Before | After |
|---|---|---|
| Section padding | `section-y` → 144px | **72px** (matches §3 and §4) |
| Column gap | `gap-14 lg:gap-20` | `gap-12 lg:gap-16` |
| **Closing block** | Last item in the left column | **Full-width banner spanning both columns** |
| Ambient motion | aurora only | aurora + **9** petals + grain |

**Section height: 1311px → 1165px (−146px, −11%).**

### The closing block redesign
It was the final child of the left column, so on desktop it ran under a column that had
already ended — leaving a large dead area to its right. It is now a **full-width card**
below the grid: quote left, CTA right, `lg:justify-between`, stacking to quote-above-button
on mobile. Styled with a soft white/70 fill, sage border and backdrop blur so it reads as a
deliberate closing statement rather than a stray paragraph, and the CTA gains far more
presence for sitting on its own.

### Ambient motion
9 petals — the lightest layer on the page, below §3's 11 and well below the hero's 28.
This is a long, largely static section (text, checklist, one image), so a little drift
keeps it alive; pink petals over the sage wash also tie the two hues together.

Running total, hero-richest-first: **28** (hero) · **16** (closing CTA) · **11** (§3) ·
**9** (here). Procedures has no ambient layer by design — its tilt cards already supply
interaction motion.

### Verified
- Captured at 1440 and 390; banner spans full width on desktop and stacks cleanly on mobile.
- Typecheck clean; contrast and a11y audits passing.

---

## 6 · Meet Your Surgeon — ✅ Reviewed

**File:** [`components/sections/MeetDoctor.tsx`](../components/sections/MeetDoctor.tsx)

### Requested
1. Fix the top and bottom spacing.
2. It's the main section about the doctor — make it a highlight, eye-catching.
3. Remove the floating badges over the photo.
4. Remove the three credential chips on the right.

### Applied — spacing
Section padding `section-y` → **72px**, matching §3–§5.
**Section height: 958px → 830px (−128px, −13%).**

### Applied — made it the highlight
This is where a nervous patient decides whether she trusts the surgeon, so it is
deliberately given more weight than its neighbours:

| Treatment | Detail |
|---|---|
| Its own background | Deeper blush wash (`blush-50 → blush-100 → blush-50`) instead of flat cream, so it separates from the sections either side |
| Richest ambient layer outside the hero | **18** petals + full aurora + grain (hero 28, this 18, closing CTA 16, §3 11, §5 9) |
| Layered portrait frame | Rose spotlight glow, slow rotating dashed gold ring, offset gold outline, arch mask, `shadow-lift` |
| Gradient name | The heading is gradient-clipped and set larger — the single most prominent line in the section |
| Pull-quote | Her philosophy lifted into a bordered, blurred quote card with a gold quote glyph |

### Applied — removals
- Both floating credential badges over the portrait. They covered her and duplicated the
  chips below. The frame now carries the emphasis instead.
- The three credential chips (*International Training · Aesthetic Breast Surgery · Body
  Contouring*) from the right column.
- With nothing left using it, `badges` was removed from `DoctorContent` **and** the content
  file — no dead data, and the compiler will flag any future page still supplying it.

### Note — no client copy was lost
The pull-quote initially repeated the bio's closing sentence verbatim, and both were
visible at once, which read as a mistake rather than an editorial device. The sentence is
now **promoted** into the quote and removed from the paragraph — every word the client
supplied still appears, exactly once. `pullQuote` is a proper content field, not a string
hardcoded in the component.

### Verified
- Captured at 1440 and 390.
- Typecheck clean; contrast and a11y audits passing.

---

## 7 · Why Trust Dr. Nicole — ✅ Reviewed

**File:** [`components/sections/WhyTrust.tsx`](../components/sections/WhyTrust.tsx)

### Requested
Fix the top and bottom spacing first.

### Applied
| Change | Before | After |
|---|---|---|
| Section padding | `section-y` → 144px | **72px** (matches §3–§6) |
| Heading → pillar grid | `mt-16` (64px) | `mt-10` (40px) |

**Section height: 1171px → 1003px (−168px, −14%).**

### 🔴 Raised — the lead paragraph and the four cards say the same thing
The section lead is the client's full paragraph, and each of the four pillar cards is a
**sentence lifted out of that same paragraph**. Rendered, the visitor reads the identical
content twice in a row:

> Lead: *"…creating elegant, natural-looking transformations inspired by Colombian aesthetic artistry. Every Mommy Makeover is carefully tailored to the individual — restoring harmony through refined body contouring rather than dramatic change. From your initial consultation through every stage of recovery…"*
>
> Card 1: *"A philosophy of creating elegant, natural-looking transformations inspired by Colombian aesthetic artistry."*
> Card 2: *"Every Mommy Makeover is carefully tailored to your anatomy, your lifestyle, and your goals."*
> Card 3: *"Restoring harmony through refined body contouring rather than dramatic change."*
> Card 4: *"From your initial consultation through every stage of recovery, Dr. Nicole and her team remain closely involved."*

Keeping the full paragraph was a deliberate call during the build ("retain the original so
nothing is lost"), but on screen it just makes the section long and repetitive — the
7-line paragraph is the single biggest block of text on the page.

**Resolved — client said "do the best".** The lead was removed; the four pillars carry
every sentence of the client's paragraph, so no supplied copy is lost. `lead` was deleted
from `WhyTrustContent` and the content file too, leaving no dead data.

### Also fixed in the same pass
| Issue | Fix |
|---|---|
| **Blended into the section above** — *Meet Your Surgeon* ends on `blush-50` and this began on `blush-50`, so there was no visible boundary | Switched to a cream-based gradient (`cream → blush-50 → cream`) |
| **Card descriptions started at different heights** — titles wrap to one or two lines depending on length | `min-h-[2.6em]` on the card title, so every description begins on the same baseline |
| Heading measure | `max-w-3xl` → `max-w-2xl` for a tighter two-line wrap |

### Final result
**Section height: 1171px → 719px (−452px, −39%)** — the largest single reduction in the
review so far, and the section is now scannable in one glance instead of asking the
visitor to read a seven-line paragraph and then read it again as cards.

### Verified
- Captured at 1440; card baselines confirmed level.
- Typecheck clean; contrast and a11y audits passing.
- [`content-map.md`](content-map.md) §8 updated to record that the paragraph now lives
  only in the pillars.

---

## 8 · Before & After — ✅ Reviewed

**Files:** [`components/sections/BeforeAfter.tsx`](../components/sections/BeforeAfter.tsx) ·
[`scripts/prepare-assets.mjs`](../scripts/prepare-assets.mjs)

### Requested
1. Fix the top and bottom spacing.
2. Remove the drag slider; use a small before/after gallery instead.
3. Show **6** cases rather than 3.
4. Remove the "Sample imagery — replace with real…" banner.
5. Replace the disclaimer with the client's supplied wording.

### Applied
| Change | Detail |
|---|---|
| Section padding | `section-y` → **72px** |
| **Drag slider removed** | Replaced by a compact side-by-side gallery. All six cases are visible at once instead of two hidden behind tabs and the third needing a drag to see either half. |
| **Now a server component** | With no drag state, the section ships **zero client-side JavaScript**. |
| 6 cases | 3 → 6, laid out 3×2 on desktop, 2-up on tablet, 1-up on mobile |
| Banner removed | The `PlaceholderNote` above the grid |
| Disclaimer | Replaced with the client's wording |

**Section height: 1623px → 1243px (−380px, −23%)** — and it now shows twice as many cases.

### ⚠ One correction to the supplied disclaimer
The wording provided read *"…determined by your own **facial** anatomy."* This is a body
page — tummy tuck, breast, liposuction — so it is used as *"your own anatomy."* The facial
wording looks carried over from a different treatment page. **Please confirm.**

### ⚠ Only three source photographs exist
Six *distinct* dummy pairs were produced by cropping the three supplied body photos two
ways each (different framing and zoom). At gallery size they read as six cases, but
cases 1/4 and 2/6 share a source and are visibly related on close inspection. Not a
problem for a placeholder set — flagged so it isn't mistaken for a rendering bug.

### What still guards the placeholders
With the banner gone, two safeguards remain and both are intentional:
- the gold **SAMPLE** ribbon on every card while `isPlaceholder` is true;
- `npm run check:content`, which **fails the build** until real photographs are in and the
  flag is cleared.

### Verified
- Captured at 1440; typecheck clean; contrast audit passing.

---

## 9 · Your Journey — ✅ Reviewed

**File:** [`components/sections/Journey.tsx`](../components/sections/Journey.tsx)

### Requested
1. Fix the top and bottom spacing.
2. Redesign — the process took up too much room.
3. Rewrite the step descriptions.
4. Animate the timeline if warranted.

### Applied
| Change | Before | After |
|---|---|---|
| Section padding | `section-y` → 144px | **72px** |
| Layout | Stacked vertical list, 5 rows | **Horizontal, 5 across** (2-up tablet, 1-up mobile) |
| Step descriptions | 1 long sentence each (~18 words) | Rewritten to ~13 words each |
| Timeline | Vertical line, scroll-filled | Horizontal line, scroll-filled left→right |

**Section height: 1250px → 623px (−627px, −50%).** The whole process is now visible in
one glance rather than five screens of scrolling.

*(The step copy is ours, drafted during the build — still pending Dr. Nicole's sign-off
for medical accuracy, as noted in [`open-questions.md`](open-questions.md) §8.)*

### 🐛 Bug fixed — every step rendered invisible
The first attempt wrapped the list items in a `RevealGroup` with `display: contents` so
they'd participate in the parent grid. But an element with `display: contents` generates
**no box**, so its `whileInView` observer never fires — the steps stayed at `opacity: 0`
and only the connector line drew.

Restructured: the connectors moved onto a positioned wrapper, and the `<ol>` itself became
the reveal group. Rule of thumb: never put a scroll-triggered wrapper on
`display: contents`.

### 🐛 Fixed — timeline looked disconnected before scrolling
The connector is two layers: a static track and a pink fill that grows with scroll
progress. The track was `sage-200` on a sage-tinted background — barely a shade apart, so
until the fill scrolled in the five steps appeared unconnected. Track raised to `sage-300`,
which reads clearly against the wash while still letting the pink fill show progress on
top of it.

### Verified
- Captured at 1440 and 390; horizontal on desktop, clean single column on mobile.
- Typecheck clean; contrast audit passing.

---

## 10 · Patient Reviews — ✅ Reviewed

**File:** [`components/sections/Reviews.tsx`](../components/sections/Reviews.tsx)

### Requested
1. Fix the top and bottom spacing.
2. Remove the "Sample reviews — replace with real, consented…" banner.
3. Remove the SAMPLE ribbon from the review cards.

### Applied
| Change | Before | After |
|---|---|---|
| Section padding | `section-y` → 144px | **72px** |
| Heading → carousel | `mt-14` (56px) | `mt-10` (40px) |
| Background | flat `blush-50` | `blush-50 → blush-100 → blush-50`, for separation from Journey's cream above |
| Placeholder banner | shown | **removed** |
| SAMPLE ribbons | on every card | **removed** |

**Section height: 967px → 737px (−230px, −24%).**

### 🔴 Important — no on-page placeholder marker remains here
With both the banner and the ribbons gone, **the dummy reviews now look completely real to
anyone viewing the page.** Two guards still stand, and neither is visible to a visitor:

| Guard | Still active |
|---|---|
| `npm run check:content` fails the build while `isPlaceholder: true` | ✅ |
| Placeholder reviews excluded from `Review` / `AggregateRating` JSON-LD | ✅ |
| "Verified patient" chip suppressed on placeholder cards | ✅ |

The build gate is now the *only* thing preventing invented testimonials reaching live
traffic. It has to stay in place until real, consented reviews are supplied — see
[`open-questions.md`](open-questions.md) §2.

The "Verified patient" chip stays hidden while the reviews are placeholders: with the
ribbon gone it would be the one element on the card actively asserting something untrue.

### Verified
- Captured at 1440; typecheck clean.

---

## 11 · FAQ — ✅ Reviewed

**File:** [`components/sections/Faq.tsx`](../components/sections/Faq.tsx)

### Requested
1. Remove the top and bottom spaces.
2. Show all questions compressed; expand only on click.

### Applied
| Change | Before | After |
|---|---|---|
| Section padding | `section-y` → 144px | **72px** |
| Heading → list | `mt-14` (56px) | `mt-10` (40px) |
| Gap between rows | `gap-3` (12px) | `gap-2.5` (10px) |
| **Default open item** | First question expanded on load | **All collapsed** (`useState(null)`) |

**Section height: 1384px → 1134px (−250px, −18%)** — and shorter still in practice, since
that measurement is with everything closed, which is now the resting state.

### Notes
- **SEO is unaffected.** All seven questions and answers are still emitted as `FAQPage`
  JSON-LD regardless of what is expanded, so Google indexes the full set exactly as before.
- **Trade-off worth recording:** with nothing open by default, the answers are not in the
  DOM until clicked, so a visitor with JavaScript disabled sees the questions but cannot
  expand them. Previously the first answer was at least visible. This is standard
  accordion behaviour and the structured data covers crawlers; noted rather than hidden.

### 🔧 Also fixed — a stale check in the audit script
`audit-a11y.mjs` was still asserting that the before/after **drag slider** is keyboard
focusable. That control was removed in §8 when the slider became a gallery, so the audit
was failing against a component that no longer exists. Replaced with a check that every
result image carries a descriptive `before`/`after` alt — now passing 12/12.

### Verified
- Captured at 1440; typecheck clean.
- Full a11y audit passing again (the failure above was the stale check, not a regression).

---

## 12 · Your Confidence Deserves Your Attention — ✅ Reviewed

**File:** [`components/sections/ConfidenceCta.tsx`](../components/sections/ConfidenceCta.tsx)

### Requested
Fix the top and bottom spacing.

### Applied
| Change | Before | After |
|---|---|---|
| Section padding | `clamp(5.5rem,11vw,9.5rem)` → 152px | **72px** |

**Section height: 820px → 660px (−160px, −20%).**

This was the most generously padded section on the page (152px vs the 144px default) since
it is the emotional peak. It now uses the same 72px as every other section; the internal
gaps between heading, paragraphs and CTAs were left slightly more generous so it still
reads as a moment rather than another content block.

An `id="confidence"` was added earlier in the review so the section can be targeted by the
QA capture scripts.

### Verified
- Captured at 1440; both CTAs and the gold divider still clear the section edges.

---

## 13 · Booking form — ✅ Reviewed

**Files:** [`components/sections/BookingForm.tsx`](../components/sections/BookingForm.tsx) ·
[`components/layout/BookAnchor.tsx`](../components/layout/BookAnchor.tsx) ·
[`lib/consultation-schema.ts`](../lib/consultation-schema.ts)

### Requested
1. Fix the top and bottom spacing.
2. Only full name, phone and email — remove the other fields.
3. Remove the contact rail from the left column.
4. Balance the left column against the form, finishing on the same line.
5. "Book" clicks go straight to the **form** on mobile, to the **section** on desktop.

### Applied
| Change | Before | After |
|---|---|---|
| Section padding | `section-y` → 144px | **72px** |
| Form fields | 7 (name, phone, email, interest chips, contact time, message, consent tick) | **3** (name, phone, email) |
| Left column | Heading + 4 contact rows (phone / WhatsApp / email / clinic) | Heading + **3 assurance points** |
| Column alignment | `items-center` — copy overhung the card | `items-stretch` + `justify-between`; card `lg:h-full` |
| Consent | Required tick-box | Inline statement under the button |

**Section height: 1153px → 672px (−481px, −42%).**

`consultationSchema` was reduced to match, so client and server validate the same three
fields — the API route needed no change.

### The left column
Every removed contact row already appears in the footer and the floating CTA bar, so
nothing was lost. Three short assurances took their place — without them the heading
floated alone against a tall form. Both columns now start and finish on the same lines.

### ⚠ Consent — worth a legal check
The required tick-box was removed to keep the form to three fields. In its place is an
inline statement beneath the button: *"By requesting a consultation you agree to be
contacted about your enquiry."* That keeps a consent notice on record without adding a
control, which is common practice for enquiry forms — but under UAE PDPL, explicit consent
is the safer standard. **Flagging for the client's own legal review;** restoring the
tick-box is a small change if preferred.

### 🐛 Two bugs found building the mobile/desktop anchor
1. **The handler never ran.** These CTAs render as `next/link`, whose own click handler
   calls `preventDefault` on the anchor. A document-level *bubble* listener fires after
   that, so the guard `if (event.defaultPrevented) return` bailed every time. Fixed by
   listening in the **capture** phase, which runs before the router.
2. **The first test gave a false pass.** It asserted only that the expected target was
   *closer* to the top than the other, which was true even when the page had not scrolled
   at all — it reported desktop as passing while nothing worked. Rewritten to assert the
   target actually sits near the viewport top, and to poll until scrolling stops rather
   than guessing a fixed wait (a ~14,000px smooth scroll outlasts a 1.4s timeout).

Also tightened `scroll-mt` on the form from `24` to `4`: `html` already sets
`scroll-padding-top: 5.5rem` and the two stack, which left ~100px of dead space above the
first field after a mobile tap.

### Verified
`node scripts/check-book-anchor.mjs <url>`:
```
✓ desktop 1440px   section at 184px from top
✓ mobile  390px    form    at 104px from top
```
Typecheck clean; contrast and full a11y audits passing.

### Follow-up — consent
The client first asked for the tick-box back, then confirmed **wording only, no tick-box**.
The inline statement stands as built; no change was needed. The legal note above still
applies.

---

## 14 · Visit the Clinic — 🗑️ Removed

Removed from `/mommy-makeover` at the client's request.

| Item | Disposition |
|---|---|
| `<ClinicMap />` in the page composition | Removed |
| `map` block in `content/mommy-makeover.ts` | Removed |
| `map` in `LandingPageContent` | Made **optional**, not deleted |
| `components/sections/ClinicMap.tsx` | **Retained** |

The component and its type were kept rather than deleted: it is a working, keyless
Google Maps embed with a branded frame and a blocked-iframe fallback, and a future
landing page may want it. Any page can render it by supplying `map` in its content file.
This does mean the component is currently unreferenced — intentional, and noted here so
it isn't mistaken for a leftover.

**Nothing was lost from the page.** The clinic name, location and a Get Directions link
still appear in the footer.

**Page height: 15,439px → 11,302px** across the review so far.

### Note
The outstanding clinic street address ([`open-questions.md`](open-questions.md) §1) is now
lower priority for this page — it is still used by the footer and by the
`MedicalBusiness` structured data, but the map that most needed it is gone.

---

## Persistent CTAs — floating WhatsApp button removed

Removed at the client's request from
[`components/layout/FloatingCta.tsx`](../components/layout/FloatingCta.tsx).

| Before | After |
|---|---|
| Desktop: floating green WhatsApp bubble with a pulsing ring, from 600px scroll | **None** — the sticky nav already carries a persistent "Book Consultation" |
| Mobile: sticky Call / WhatsApp / Book bar | **Unchanged** |

WhatsApp remains reachable from the mobile bar, the closing CTA and the footer. The now
unused `useReducedMotion` import was cleaned up with it.

---

## 15 · Footer — ✅ Reviewed

**File:** [`components/layout/Footer.tsx`](../components/layout/Footer.tsx)

### Requested
Rebuild as three columns: an enlarged animated logo · contact + connect · a pinned map.
Plus: remove the medical disclaimer, centre and reword the copyright, add a separator
above it, fix the WhatsApp icon, and balance the columns.

### Applied
| Column | Content |
|---|---|
| 1 · Brand | Logo at 160/192px with two breathing halos behind it. Role/location line removed. |
| 2 · Contact | Phone + email, then **Connect with us** — Instagram, Facebook, **WhatsApp**. Clinic address rows removed. |
| 3 · Location | "Visit the Clinic" — keyless map pinned to the exact coordinates, labelled, whole card opens Google Maps. |

Explore and Treatments link columns were dropped — the page is a single scroll with a
sticky nav, so in-page anchors in the footer duplicated navigation the visitor already had.

### Real coordinates, finally
The client supplied `25.13966512152247, 55.20361384037153`. `site.ts` now carries
`clinic.coordinates` and an exact directions URL; the guessed `mapQuery` string is gone.
`ClinicMap` was updated to match, so the retained component still compiles.

### Iterations worth recording
| Attempt | Problem | Resolution |
|---|---|---|
| Logo with `anim-bob` | A bobbing brand mark read as restless | Logo made **static**; two offset breathing halos behind it carry the motion |
| Map by place-name query | Rendered an off-centre marker plus Google's "Open in Maps" chip | Back to a coordinates query — centred, no chip |
| Custom pin + Google's marker | **Two** indicators on one map | Google's marker is the only pin; our label sits just above it |
| Column 2 `justify-between` | Closed the height gap but opened a large void between email and "Connect with us" | Top-aligned with a natural gap — "CONTACT" sits level with "VISIT THE CLINIC" |
| Phone in `font-display` | Playfair is reserved for headings site-wide; a serif phone number read as a different brand | `font-sans`, size carries the emphasis. Every footer element is now Manrope. |

The map card is a link with the iframe set to `pointer-events-none`, so a click opens
Google Maps instead of panning the embed.

### ⚠ Medical disclaimer removed
Removed from the footer at the client's request. The text is **retained** in
`content/site.ts` as `legal.disclaimer` so it can be reinstated with one line. DHA health
advertising guidance generally expects a results-vary / not-medical-advice notice on a
surgical page — flagged for the clinic's own legal review.

Copyright now reads *"© 2026 Dr. Nicole Echeverry | Designed and Developed by HolistiQ
Digital"*, centred, above a gold hairline separator.

---

## Page-wide spacing pass — ✅ Done

The client felt the reviewed 72px rhythm was still too generous and asked for every
section to match.

**All fourteen sections previously hardcoded the identical
`py-[clamp(2.5rem,5vw,4.5rem)]`** — the same value copy-pasted fourteen times, so any
future change meant fourteen edits and any missed file would silently drift.

Centralised into the shared `section-y` utility in `globals.css` and reduced there:

```css
@utility section-y {
  padding-block: clamp(2rem, 4vw, 3.5rem);   /* was clamp(5rem, 10vw, 9rem) */
}
```

**56px desktop / 32px mobile — one edit now retunes the whole page.**

### Final measurements (1440px)
Every content section: **56px top, 56px bottom.** Hero keeps a larger 132px top to clear
the 117px fixed header, with a matching 56px bottom.

| | Start of review | Now |
|---|---|---|
| Page height | 15,439px | **10,929px** |

**−4,510px, a 29% reduction**, with no content lost — only the map section and the
duplicated "Why Trust" lead were removed, and both were redundant.

### Verified after the pass
- Contrast: every pair passes AA at 1440 and 390
- Accessibility, reduced-motion, no-JS: all passing
- Page height stable (no self-shifting)
- Book anchor: desktop → section, mobile → form
- Typecheck clean

### Second reduction
Reduced again on request: `clamp(1.75rem, 3.2vw, 2.75rem)` → **44px desktop / 28px
mobile**. Hero bottom matched at 44px; its top stays at 132px to clear the fixed header.

| | Start of review | Now |
|---|---|---|
| Page height | 15,439px | **10,653px** |

**−4,786px, −31%.**

---

## Scroll performance — ✅ Fixed

The client reported scroll lag. Measured with
[`scripts/check-scroll-perf.mjs`](../scripts/check-scroll-perf.mjs) on the **production**
build (dev-server numbers are meaningless — one sample showed a 5.5s frame that was just
Next.js compiling on demand).

### Baseline
`8.7 fps` at 4× CPU throttle, 68% of frames over budget.

### Diagnosis
[`scripts/bisect-scroll-perf.mjs`](../scripts/bisect-scroll-perf.mjs) disables one effect
at a time and re-measures. No single effect dominated — but disabling *all* of them jumped
to 35fps. The cost was **cumulative**: six aurora instances (18 blurred layers), five petal
canvases, five grain overlays and a blend-mode cursor glow, all layered across one long page.

### Fixes, in order of impact
| Change | Why |
|---|---|
| **Aurora rebuilt without `filter: blur()`** | Soft radial-gradients look identical at these opacities and are a plain paint — no separate blur pass to re-rasterise |
| **Aurora instances 6 → 3** | Hero, Meet Your Surgeon, closing CTA only |
| **Petal canvases 5 → 2** | Hero and closing CTA — the two moments where it registers |
| **Grain overlays 5 → 2** | Same two sections |
| **CursorGlow removed** | A viewport-sized fixed layer with `mix-blend-mode: soft-light` forces the entire stacking context to re-composite on every pointer move and scroll frame |
| **Aurora keyframes: translate only, no `scale`** | Scaling changes a layer's rasterised size every frame; pure translation lets the compositor cache and move it |
| **Nav `backdrop-blur-xl` → `blur-sm` at 95% opacity** | A full-width backdrop filter re-composites on every scroll frame; more opacity needs less blur |
| **Canvas DPR capped 2 → 1.5** | Soft translucent blobs; the extra buffer pixels are invisible, the fill cost is not |

### Result
| Profile | Before | After |
|---|---|---|
| 4× CPU throttle | 8.7 fps · 68% janky | **~22 fps · worst frame 291ms** |
| **Unthrottled (real desktop)** | — | **51 fps · 0.7% janky — smooth** |

At 4× throttle the bisect now returns ~19fps whichever effect is disabled, i.e. the
remaining cost is ordinary layout and paint of a long page, not the ambient effects. There
is nothing left worth stripping without gutting the design.

Core Web Vitals held throughout: **FCP 1.51s · LCP 1.96s · CLS 0.007** on throttled mobile.

> **Measure on the production build, never `next dev`.** One dev-server sample reported a
> 5.5-second frame; that was Next.js compiling a route on demand, not the page. All figures
> above come from `next build` + `next start`.

---

## Browser tab icon — ✅ Added

`npm run assets` now generates `app/icon.png` (512×512) and `app/apple-icon.png` (180×180),
which Next.js picks up automatically as the favicon and the iOS home-screen icon.

Built from the **NE/EN monogram only** — the full lockup also carries "NICOLE ECHEVERRY"
and a line of Spanish credentials that are illegible at 32px. The monogram's bounds were
measured from the artwork's alpha channel rather than eyeballed: it occupies y29–304 of the
800×450 source, with the wordmark starting at y338.

The mark is white, so it sits on a plum tile. A transparent white glyph would disappear
against a light browser tab bar; the tile reads on both light and dark chrome.

*Implementation note:* chaining `.extract().trim()` in a single sharp pipeline fails with
"bad extract area" — the crop is done to a buffer first, then trimmed in a second pass.
