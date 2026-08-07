# Open Questions & Missing Assets

Nothing here blocks the build. Items marked 🔴 must be resolved before the page goes live to real traffic.

---

## ✅ Resolved

### Name spelling → **Echeverry**
Client confirmed: use the logo spelling. Corroborated by her own website, Doctify and RealSelf.

Applies to all display copy, titles, meta, OG cards, structured data, alt text.
**Not applied** to `dranicolecheverry.com`, or the Facebook/Instagram URLs — those are live endpoints and stay byte-for-byte as supplied.

### Before/after → **real photographs supplied** ✅
**Three** clinic-supplied composites (before left, after right, already watermarked) — a
replacement set provided 3 Aug 2026, cut down from the six used previously.
`results.isPlaceholder` is `false`, so the sample ribbons and the content-gate warning for
this section are gone.

They are used **whole and never split down the middle**. The seam is not at the midpoint —
in this set it sits at x=321, x=350 and x=364 on a 700px canvas — so a fixed 50% cut would
slice through a patient's body. See the note in `scripts/prepare-assets.mjs`.

`npm run assets` deletes any case file the current set no longer produces, so the retired
photographs are gone from `public/` rather than left unreferenced in a public repository.

Two things still outstanding on these:

| | |
|---|---|
| 🔴 **Consent on file** | Real, identifiable patients. Written consent for web and paid-advertising use must exist before this page takes traffic. |
| 🟡 **Per-case detail** | `caption` and `detail` are deliberately empty. The old values ("Breast lift", "6 months post-op") were invented for the dummy gallery; under a real patient's photograph the same words become a clinical claim about a specific person. Supply the real procedure and timeline per case and they render automatically. |

### Patient reviews → **real reviews supplied** ✅
Six client-supplied reviews replaced the samples. `reviews.isPlaceholder` is now `false`.

Reproduced as supplied, including their spelling and grammar slips. A tidied-up
testimonial is no longer the words the patient wrote, and on a medical page that
distinction is worth more than the polish. Say the word if you want them copyedited.

Four things to decide on these:

| | |
|---|---|
| 🟡 **No star ratings** | None were supplied, so the stars do not render. Five stars is the likely answer and that is not a good enough reason to publish it under a real person's name. Supply the real ratings and they reappear with no code change. |
| 🟡 **"Verified patient" badge now shows** | It renders on every non-placeholder review. It is a factual claim — confirm the clinic can stand behind it, or say so and I will remove it. |
| 🟡 **One review is for a facelift** | *"I did with the dr a full facelift"* — genuine, but on a Mommy Makeover page it is off-message, and a visitor scanning for body-contouring results may find it confusing. Your call whether to keep it here or save it for a facial page. |
| ✅ **Colombia reference** | Resolved 3 Aug 2026 — the client cut *"You have to come to Colombia to do it"* from one review. *"I now have family in Colombia"* remains in another. |
| 🟡 **Two quotes were shortened** | On 3 Aug 2026 the client removed clauses from two reviews — the Colombia line above, plus *"Everything healed extremely quickly"* and the *"Barbie body sculptor / my dream body"* passage. Trimming a testimonial is a stronger edit than fixing a typo: it changes what a named person is on record as saying, and advertising standards in most markets expect testimonials to be presented without misleading omission. Both edits remove *praise* rather than caveats, which is the safer direction — but if these came from a review platform, the published original still stands next to the shortened one. Worth a glance from whoever owns the compliance risk. |

> **Do not mark these up as first-party `Review` structured data** if they were collected on a
> third-party platform — Google's guidelines prohibit it. No review structured data is emitted
> at all today, so nothing needs changing; this is a note for whoever is tempted to add it.

No `descriptor` (e.g. "Mother of two · Dubai") was supplied, so that line is omitted rather
than invented.

**Guards so dummy content can't quietly ship:**
| Guard | Status |
|---|---|
| `isPlaceholder: true` | One flag per block controls everything below |
| **JSON-LD exclusion** | ✅ **Active and unconditional** — placeholder reviews never emit `Review`/`AggregateRating`, so no fabricated ratings reach Google |
| `npm run check:content` | ⚠️ **Warns, does not fail.** Prints the offending blocks on every build. Set `STRICT_CONTENT=1` to make it a hard failure once real content is in |
| `SAMPLE` ribbon | ❌ Removed from reviews and the results gallery at the client's request |
| Dev console warning | Development only |

> **The on-page markers are gone.** The reviews and before/after imagery now look
> completely real to a visitor. The structured-data exclusion is the only remaining
> automatic protection; everything else depends on someone replacing the content before
> the page is advertised.

Both the reviews and the before/after imagery are now genuine. The remaining placeholder on
the page is the **trust bar statistics** (`trust.isPlaceholder`) — years of experience,
procedures performed, countries trained in, patient satisfaction — which are still invented
and are the last thing the content gate flags.

### Clinic location on a map
Added as section 15, "Visit the Clinic" — keyless Google Maps embed (no API key or billing account), brand-framed with a gold hairline and blush vignette, lazy-mounted, with a static fallback card if the iframe is blocked. Clinic name resolved from the share link: **Kasaesthetic Clinic**. Address still needed — see below.

---

### Training & affiliation logos → **supplied** ✅
Five marks — ASPS, ISAPS, AASMA, Universidad del Sinú, Universidad del Tolima — render as a
ribbon directly beneath the bio, where the "international training" claim is made.

Shown desaturated, going to full colour on hover. The five sit in four unrelated brand
palettes (red, teal, cyan, orange) and at full strength they fight both each other and the
calm palette the page was built around.

| | |
|---|---|
| 🟡 **Usage rights** | Professional societies publish logo guidelines, and some require member marks to appear in their official colours and forbid alteration. Greyscale-with-colour-on-hover is common practice and generally accepted, but confirm ASPS and ISAPS permit it — and that the clinic's membership in each is current. Displaying a society mark without active membership is a misrepresentation, not a design choice. |

---

### Trust bar figures → **supplied** ✅
Four client-supplied figures replaced the invented ones on 3 Aug 2026, so
`trust.isPlaceholder` is `false` and **`npm run check:content` now passes clean** — no
placeholder blocks remain anywhere on the page.

| | |
|---|---|
| 🟡 **"Zero — scars on body"** | The client's wording, reproduced verbatim. An abdominoplasty leaves a scar by definition, and this page sells tummy tuck alongside breast surgery and liposuction, so as written it reads as a claim of *no scarring at all*. DHA health-advertising rules prohibit misleading claims, and Google Ads applies its own scrutiny to healthcare creative. If the intended meaning is that scars are placed where underwear hides them, wording it that way is both true and more persuasive — "Hidden" / "Scar placement", say. Worth a decision before this runs in paid advertising. |
| 🟡 **"Double — board certified"** | Verify which two boards, and that both are current. |

---

## 🔴 Must resolve before launch

### 1. Clinic street address — 🟡 downgraded, no longer blocking
**Coordinates were supplied** (`25.13966512152247, 55.20361384037153`) and now live in
`content/site.ts` as `clinic.coordinates`. The footer map pins the clinic exactly and the
Get Directions link is precise, so the map no longer depends on this.

Still wanted: building/tower name, street, area, emirate — for the `MedicalBusiness`
structured data, which is what earns the Google local panel. Left blank rather than
approximated: a wrong address on a medical page sends patients to the wrong building.

### 1b. Two items removed at the client's request — flagged for legal review
| Item | Status |
|---|---|
| **Medical disclaimer** in the footer | Removed. Text retained in `site.ts` as `legal.disclaimer`, reinstatable in one line. DHA health-advertising guidance generally expects a results-vary / not-medical-advice notice on a surgical page. |
| **Consent tick-box** on the booking form | Removed; replaced by an inline statement beneath the submit button. Common practice for enquiry forms, but explicit consent is the safer standard under UAE PDPL. |

Neither is a blocker we can resolve — both need the clinic's own legal call.

### 2. Real patient reviews
Dummy content is approved for now, but the build gate will block launch until real ones are in. 3–6 reviews, each with quote, first name or initial, descriptor, star rating, and **written consent on file**. Existing Google or Instagram reviews are the easiest source.

### 3. Real before/after photographs
Same gate. 3–5 matched pairs, consistent lighting/angle/crop, faces excluded or cropped, written consent for public web use.
**Compliance:** DHA restricts before/after imagery in medical advertising — confirm what's permitted for Dr. Nicole's licence category before publishing any.

### 4. Where should form submissions go?
The API route is built, validated and rate-limited — it just needs a destination.

| Option | Effort | Notes |
|---|---|---|
| **Email inbox** (via Resend) | ~15 min | Simplest. Needs an API key + destination address. Recommended. |
| **WhatsApp only** | 0 min | Already works via the deep link — but captures no form data |
| **Google Sheet** | ~30 min | Good if the team wants a trackable list |
| **CRM / clinic system** | varies | Tell us which one |

Default until you choose: submissions validate and return success, and the WhatsApp path works immediately.

---

## 🟡 Should resolve before launch

| # | Item | Notes |
|---|---|---|
| 5 | **Consultation hours** | For the map details card |
| 6 | **Trust-strip statistics** | Placeholders in place (`10+ years`, `1,500+ procedures`, `3 countries`, `98% satisfaction`). Supply real figures, or say the word and we'll swap the strip for non-numeric credibility markers instead |
| 7 | **Credentials & licences** | DHA/MOH licence number, board certifications, memberships (SCARE, ISAPS, ASAPS), training institutions. Public sources show Universidad del Tolima, Universidad de Sinú and SCCP — please confirm and complete |
| 8 | **"Your Journey" copy sign-off** | The five steps (content map §10) were written by us. Dr. Nicole should review for medical accuracy |
| 9 | **Is Kasaesthetic the operating facility?** | Or does she consult there and operate elsewhere? Affects the map copy and structured data |
| 10 | **Consultation logistics** | Is there a fee? Are virtual consultations offered? (Big deal for international patients — one review in the dummy set assumes yes.) Typical response time — the form currently promises "within one working day" |

---

## 🟢 Nice to have

| # | Item | Why |
|---|---|---|
| 11 | Arabic version | Large addressable audience in Dubai. Architecture already supports an `ar` locale |
| 12 | A short video, even 15s of Dr. Nicole speaking | Nothing converts a nervous patient like seeing and hearing her surgeon |
| 13 | GA4 / Meta Pixel / TikTok Pixel IDs | Needed if paid traffic will be driven here |
| 14 | A signature image or scan | Powers the "signature draws itself" flourish in Meet Dr. Nicole |
| 15 | Higher-resolution logo (SVG ideal) | Current logo is an 800×450 PNG, white-on-transparent |
| 16 | Privacy policy & terms pages | Required for Meta ads, expected for a form collecting personal data |
| 17 | Financing / payment plan info | A common objection at this price point |

---

## Decisions we made without you (all reversible)

| Decision | Rationale | To change |
|---|---|---|
| Page lives at `/mommy-makeover` | Your instruction | — |
| Colour direction: blush pink + deep plum + champagne gold | "Cute pink" that still reads premium and medical, not juvenile | Swap tokens in `globals.css` — the whole site follows |
| Fonts: Playfair Display + Manrope | Playfair matches the logo's Didone serif almost exactly | One line in `app/layout.tsx` |
| Added a "Your Journey" section | Answers the biggest unstated objection: "what actually happens to me?" | Delete one line from the page composition |
| Split "Why Trust Dr. Nicole" into 4 pillars | The source is one dense paragraph — nobody reads those on mobile. Full paragraph retained as the section lead | Content file |
| Dummy reviews avoid outcome claims and numbers | Keeps them credible and DHA-compliant, and models the tone real ones should have | Content file |
| Keyless map embed rather than the Maps JavaScript API | Works on deploy with no API key, no billing account, no key-leak risk | — |
| No pricing anywhere | Premium surgical positioning; price is a consultation conversation | Add a section if you disagree |
| English only for v1 | Fastest route to launch | Architecture supports `ar` later |
| Multi-page platform architecture from day one | Your instruction — more landing pages are coming | — |

---

## What we need from you, in priority order

1. **Clinic street address** 🔴
2. **Real patient reviews** (3–6, with consent) 🔴
3. **Real before/after photos**, if DHA rules permit 🔴
4. **Where form submissions should go** 🔴
5. Consultation hours 🟡
6. Real statistics for the trust strip 🟡
7. Credentials, licence numbers, memberships 🟡
8. Sign-off on the "Your Journey" copy 🟡

Items 1–4 are the launch gate. Everything else can follow the page live.
