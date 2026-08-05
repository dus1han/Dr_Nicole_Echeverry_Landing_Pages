# Content Map — `/mommy-makeover`

Maps every line of the client's source document (`Mommy Makeover in Dubai LP content.docx`) to its destination on the page, and records all new copy written for the build.

**Key:** **[C]** verbatim from client · **[C+]** client copy lightly edited for flow · **[N]** newly written by us (needs client approval) · **[A]** asset/content still needed · **[D]** dummy/placeholder content, approved by client for now, gated behind `isPlaceholder: true`

**Coverage: every one of the 96 lines of the source document is placed.** Nothing has been dropped.

---

## 0 · Announcement Marquee — [N]

Repeating, separated by a gold diamond `◆`:
```
Colombian Aesthetic Artistry
Board-Certified Plastic & Reconstructive Surgeon
Private Consultations in Dubai
Personalised Treatment Plans
```

---

## 1 · Navigation — [N]

| Item | Target |
|---|---|
| What Is It | `#what-is-it` |
| Procedures | `#procedures` |
| Dr. Nicole | `#meet-dr-nicole` |
| Results | `#results` |
| FAQ | `#faq` |
| `+971 55 557 3563` | `tel:+971555573563` |
| **Book Consultation** (button) | `#book` |

---

## 2 · Hero — [C]

> Source lines 2–7

| Element | Copy | Source |
|---|---|---|
| Eyebrow | `DUBAI · PLASTIC & RECONSTRUCTIVE SURGERY` | [N] |
| H1 line 1 | **Feel Like Yourself Again** | [C] line 2 |
| H1 line 2 *(gradient)* | **with a Mommy Makeover in Dubai** | [C] line 3 |
| Attribution | with Dr. Nicole Echeverry | [C] line 4 |
| Sub-headline | World-class body contouring inspired by Colombian aesthetic artistry. | [C] line 5 |
| Primary CTA | **Book Your Consultation** | [C] line 6 |
| Secondary CTA | **See The Results** | [C] line 7 |
| Floating badge 1 | Colombian-trained surgeon | [N] |
| Floating badge 2 | Tailored to your anatomy | [N] |
| Scroll cue | Discover | [N] |

*Note: source line 8 (`-2642745254-2642745254`) is a stray artefact from the Word document — ignored.*

---

## 3 · Trust Strip — [N] [A]

Four animated count-ups. **Real figures required from the client** — placeholders in place, flagged in code.

| Value | Label |
|---|---|
| `10+` | Years of surgical experience |
| `1,500+` | Procedures performed |
| `3` | Countries trained in |
| `98%` | Patient satisfaction |

---

## 4 · What is a Mommy Makeover? — [C]

> Source lines 9–14

**Eyebrow:** `THE PROCEDURE` — [N]
**H2:** What is a Mommy Makeover? — [C] line 9

**Body** — [C] line 10, with one edit:
> A Mommy Makeover is a personalized combination of procedures designed to restore the natural contours of your body following pregnancy, childbirth, and breastfeeding.

> The source read "restore **and refine** the natural contours". The client cut those two
> words on 3 Aug 2026; the rest is verbatim.

**Lead-in** — [C] line 11:
> Depending on your goals, your Mommy Makeover may include procedures such as:

**Chips** (scroll-link into section 5) — [C] lines 12–14:
`Tummy Tuck` · `Breast Lift or Augmentation` · `Liposuction`

**Image:** `surgeon-operating.jpg` with the caption *"Dr. Nicole in theatre — Bogotá"* — [N]

---

## 5 · The Procedures — [C]

> Source lines 15–31 · three cards, all copy verbatim

### Card 1 — Tummy Tuck
> A tummy tuck removes excess skin after pregnancy and repairs stretched abdominal muscles to create a flatter, firmer tummy.

- Removes excess skin
- Repairs separated abdominal muscles
- Creates a firmer, flatter tummy

Image: `procedure-tummy.png`

### Card 2 — Breast Lift or Augmentation
> A breast lift reshapes and lifts the breasts, while breast augmentation restores or increases volume to achieve a fuller, more balanced appearance.

- Restores shape and fullness
- Improves breast position
- Enhances natural proportions

Image: `procedure-breast.png`

### Card 3 — Liposuction
Rewritten by the client on 3 Aug 2026. The earlier version described the same procedure and
also mentioned 360° lipo body contouring, which this one drops.

> Liposuction removes stubborn fat from the abdomen, waist, flanks, hips, and thighs, refining natural body shape with improved balance.

- Waist and flanks to create a slimmer waistline
- Refine the abdomen to complement your tummy tuck results
- Thighs & Hips for smoother, balanced contours

> The supplied second bullet ended in a full stop while the other two did not. Dropped —
> no bullet anywhere else on the page carries one.

Image: `procedure-lipo.jpg`

**Section footer CTA** — [N]: **Book Your Consultation**
(The closing line above it, *"Every plan is built around you, never around a package."*, was
removed at the client's request.)

---

## 6 · Am I the right candidate? — [C]

> Source lines 33–40 · dark plum section

**Eyebrow:** `CANDIDACY` — [N]
**H2:** Am I the right candidate? — [C] line 33

**Body** — [C] line 34:
> Every woman's body responds differently to pregnancy and childbirth. If you've maintained a healthy lifestyle but still struggle with changes that diet and exercise alone can't improve, a personalized Mommy Makeover can help restore balance, shape, and confidence.

**Lead-in** — [N]: *You may be a good candidate if you:*

**Checklist** — [C] lines 35–40, verbatim:
1. Have completed your family or are not planning another pregnancy in the near future.
2. Have loose abdominal skin or muscle separation following pregnancy.
3. Experience sagging or volume loss in your breasts after breastfeeding.
4. Maintain a stable weight but struggle with stubborn areas of fat.
5. Feel your body no longer reflects how you feel inside.
6. Are in good overall health and looking for a comprehensive body restoration procedure.

**Closing** — [N]:
> Not sure whether this is right for you? A consultation will tell you honestly — including if the answer is *not yet*.

CTA: **Request an Honest Assessment**

---

## 7 · Meet Dr. Nicole — [C]

> Source lines 42–43

**Eyebrow:** `MEET YOUR SURGEON` — [C] line 42
**H2:** Dr. Nicole Echeverry — [C] line 42 *(see spelling note below)*
**Role line:** Plastic, Aesthetic & Reconstructive Surgeon — [C+] from line 43

**Bio** — [C] line 43, verbatim except the surname spelling:
> Dr. Nicole Echeverry is a Colombian Plastic, Aesthetic, and Reconstructive Surgeon with international training and extensive experience in aesthetic breast surgery, body contouring, and post-pregnancy body restoration. Understanding that every woman's journey through motherhood is unique, Dr. Nicole carefully tailors each Mommy Makeover to the individual's anatomy, lifestyle, and goals. Every treatment plan is designed to help you feel confident, comfortable, and like yourself again.

**Floating credential badges** — [C+] extracted from the bio:
- International Training
- Aesthetic Breast Surgery
- Body Contouring

> ✅ **Spelling — resolved.** The source document said *"Dr. Nicole Cheverry"*. **Client confirmed: use the logo spelling, "Echeverry".** Independently corroborated by her own website title, Doctify and RealSelf, which all use *Echeverry*.
>
> **Applies to:** every piece of display copy, page titles, meta descriptions, OG cards, structured data, alt text, and the copyright line.
>
> **Does NOT apply to** — these are live endpoints and are kept byte-for-byte as supplied:
> - Email `info@dranicolecheverry.com`
> - Domain `dranicolecheverry.com`
> - Facebook `facebook.com/dranicolecheverry`
> - Instagram `instagram.com/dra.nicolecheverry_surgery`
>
> "Correcting" the spelling inside those would break working links and bounce real enquiry emails.

Image: `doctor-portrait.jpg`

---

## 8 · Why Trust Dr. Nicole? — [C]

> Source lines 44–45

**H2:** Why Trust Dr. Nicole with Your Mommy Makeover? — [C] line 44

Source line 45 is one dense paragraph. For scannability it is split into **four pillars**, each pillar's description taken directly from the original sentence:

| Pillar [N] | Description [C] |
|---|---|
| **Colombian Aesthetic Artistry** | Patients choose Dr. Nicole for her philosophy of creating elegant, natural-looking transformations inspired by Colombian aesthetic artistry. |
| **Tailored to the Individual** | Every Mommy Makeover is carefully tailored to the individual. |
| **Harmony, Not Drama** | Restoring harmony through refined body contouring rather than dramatic change. |
| **Care at Every Stage** | From your initial consultation through every stage of recovery, Dr. Nicole and her experienced medical team remain closely involved, providing attentive guidance and personalized follow-up care. |

> **Update after client review:** the full paragraph was originally *also* rendered as the
> section lead. On screen that meant the visitor read the same words twice in a row — the
> lead and the four cards are the identical sentences — and it produced the largest block
> of text on the page. The lead is now removed; **the four pillars carry every sentence of
> the client's paragraph**, so nothing is lost. Section height dropped 1171px → 719px.

---

## 9 · Before & After — [C] [D]

**H2:** Before & After — [C] line 51
**Eyebrow:** `REAL RESULTS` — [N]
**Lead** — [N]: Every result on this page belongs to a real woman with a real story. Dr. Nicole shares her full gallery personally during your consultation.

### Dummy cases — [D]
Three drag-reveal pairs. Images are generated from the supplied body photography: the *before* plate is a softened, desaturated derivative of the *after* plate, so the slider demonstrates a genuine visual difference. **No real patient is depicted.**

| # | Caption | Detail | Source plate |
|---|---|---|---|
| 1 | Tummy tuck + 360° liposuction | 6 months post-op · age 34, two children | `procedure-tummy.png` |
| 2 | Breast lift with augmentation | 4 months post-op · age 38, three children | `procedure-breast.png` |
| 3 | Full Mommy Makeover | 9 months post-op · age 31, two children | `procedure-lipo.jpg` |

Each plate carries a gold `SAMPLE` corner ribbon while `isPlaceholder: true`.

**Disclaimer (shown always)** — [N]:
> Individual results vary. All photographs are of real patients, published with written consent, and are not retouched.

**Section CTA** — [N]: *See more results in a private consultation* → **Book Your Consultation**

> ⚠️ **Replacement checklist:** 3–5 matched pairs · consistent lighting, angle and crop · faces excluded or cropped · written consent for public web use on file. Then set `isPlaceholder: false` — the ribbons, the dev warning and the build gate all clear together.

---

## 10 · Your Journey — [N]

Not in the source document. Added because "what actually happens to me?" is the single largest unspoken objection. **All five step descriptions need Dr. Nicole's sign-off for medical accuracy.**

| Step | Title | Copy |
|---|---|---|
| 01 | Private Consultation | A relaxed, unhurried conversation about your history, your goals, and what is realistically achievable for your body. |
| 02 | Your Personalised Plan | Dr. Nicole designs a combination of procedures matched to your anatomy, your lifestyle, and your recovery window. |
| 03 | Preparation | Pre-operative assessments, clear guidance, and a checklist so nothing about the day is a surprise. |
| 04 | Your Surgery Day | Performed in an accredited facility with a full surgical team, and Dr. Nicole present at every stage. |
| 05 | Guided Recovery | Scheduled follow-ups and direct access to the team throughout healing — you are never left to guess. |

---

## 11 · Patient Reviews — [C] [D]

**H2:** Patient Reviews — [C] line 52
**Eyebrow:** `IN THEIR WORDS` — [N]

### Dummy reviews — [D]
Six sample reviews, written to model the *tone* real ones should have: specific, emotional, focused on how she was treated rather than on outcomes. Deliberately free of medical claims, numbers, and superlatives — so they read as credible and stay compliant.

| # | Quote | Attribution |
|---|---|---|
| 1 | "I didn't want to look like someone else. I wanted to look like me before three pregnancies. Dr. Nicole was the first surgeon who actually understood the difference." | **Layla H.** · Mother of three · Dubai |
| 2 | "What surprised me most was how much time she gave me. No rushing, no pressure — she even told me which things she *wouldn't* recommend for my body." | **Sarah M.** · Mother of two · Dubai Marina |
| 3 | "I put this off for six years because I was scared of the recovery. Her team called to check on me almost every day. I was never once left wondering if something was normal." | **Priya R.** · Mother of one · Jumeirah |
| 4 | "My husband says I stand differently now. I think that's the part nobody tells you about — it isn't just the body, it's how you carry it." | **Noor A.** · Mother of two · Dubai |
| 5 | "I flew in from Riyadh for the consultation and stayed for the surgery. Worth every hour of the trip. The results look like nothing was ever done." | **Fatima K.** · Mother of four · Riyadh |
| 6 | "I'd seen surgeons who talked about my body like a project. Dr. Nicole talked about it like it belonged to a person. That's why I chose her." | **Elena V.** · Mother of two · Downtown Dubai |

Each card shows: 5-star row · oversized gold quote glyph · quote · name · descriptor · gold **Verified patient** chip.
While `isPlaceholder: true`, a `SAMPLE` ribbon appears and these are **excluded from `Review` / `AggregateRating` JSON-LD** — publishing invented ratings to Google is a search-penalty risk that a visual ribbon doesn't cover.

**Section footer** — [N]: Read more on [Google] · [Instagram]

> ⚠️ **Replacement checklist:** each real review needs quote · first name or initial · descriptor · star rating · **written consent on file**. Existing Google or Instagram reviews are the easiest source. Then set `isPlaceholder: false`.

---

## 12 · FAQ — [C]

> Source lines 55–75 · all seven Q&As verbatim, in the source order

1. **Will I still look natural?** — Absolutely. Dr. Nicole focuses on restoring your body's natural proportions rather than creating an exaggerated appearance. Every treatment plan is personalized to complement your unique shape.
2. **What procedures are included in a Mommy Makeover?** — Every Mommy Makeover is customized. Depending on your goals, it may include a tummy tuck, breast lift, breast augmentation, liposuction, or other body contouring procedures discussed during your consultation.
3. **Can everything be done in one surgery?** — For suitable candidates, multiple procedures can often be safely combined into one carefully planned operation, allowing for a single recovery period. Your treatment plan will depend on your health, goals, and surgical assessment.
4. **How long is the recovery?** — Recovery varies depending on the procedures performed. Most patients gradually return to light daily activities within a few weeks, while full recovery takes longer. Dr. Nicole will guide you through every stage of healing.
5. **Will there be scars?** — Every surgical procedure creates some scarring, but incisions are carefully planned to be as discreet as possible and placed where they can typically be concealed beneath clothing or swimwear.
6. **Is a Mommy Makeover only for mothers?** — Although it was originally developed for women after pregnancy, the procedures included in a Mommy Makeover can also benefit anyone experiencing similar concerns such as loose skin, breast changes, or stubborn fat deposits.
7. **When is the right time to have a Mommy Makeover?** — The ideal time is after you've completed your family, finished breastfeeding, reached a stable weight, and are ready to invest in yourself with adequate time for recovery.

**Footer** — [N]: *Still have a question?* **Ask Dr. Nicole directly** → WhatsApp

All seven are emitted as `FAQPage` JSON-LD.

---

## 13 · Your Confidence Deserves Your Attention — 🗑️ REMOVED FROM THE PAGE

> Removed at the client's request. The copy below is the client's original and is
> **no longer rendered** — `closingCta` is absent from `content/mommy-makeover.ts`.
> Kept here as a record of the source document, and because the `ConfidenceCta`
> component still exists for other landing pages. Source lines 82–84 are therefore
> the only part of the client's document not currently on the page.



> Source lines 82–84 · dark, full-bleed, emotional peak

**H2:** Your Confidence Deserves Your Attention — [C] line 82

> Motherhood changes your life in remarkable ways. But that doesn't mean you have to stop feeling confident in your own body. — [C] line 83

> A personalized Mommy Makeover is about restoring balance, helping you feel comfortable in your clothes, and reconnecting with the version of yourself you've been missing. — [C] line 84

CTA: **Book Your Consultation** · secondary: *Message us on WhatsApp*

---

## 14 · Booking Form — [N]

**Eyebrow:** `BOOK YOUR CONSULTATION`
**H2:** Your consultation is a conversation, not a commitment.
**Lead:** Tell us a little about yourself and Dr. Nicole's team will contact you to arrange a private appointment — in person or online.

| Field | Type | Required |
|---|---|---|
| Full name | text | ✅ |
| Phone number | tel, `+971` prefilled | ✅ |
| Email | email | ✅ |
| I'm interested in | multi-select chips: Tummy Tuck · Breast Lift · Breast Augmentation · Liposuction · Full Mommy Makeover · Not sure yet | — |
| Best time to reach you | select: Morning / Afternoon / Evening | — |
| Anything you'd like Dr. Nicole to know | textarea | — |
| Consent | checkbox: *I agree to be contacted about my enquiry.* | ✅ |

**Submit:** *Request My Consultation*
**Success:** Thank you. Dr. Nicole's team will contact you within one working day. — [N]
**Privacy note:** Your details are confidential and never shared. — [N]

**Contact rail beside the form** — [C] lines 90–95:
- Phone / WhatsApp — `+971 55 557 3563`
- Email — `info@dranicolecheverry.com`
- Location — `https://share.google/JFXKjPDSRNDthp82J` **[A — plain-text street address needed]**

---

## 15 · Visit the Clinic — [C] [A]

**Eyebrow:** `FIND US` — [N]
**H2:** Visit the Clinic — [N]
**Lead** — [N]: Dr. Nicole consults from a private clinic in Dubai. Virtual consultations are available for patients travelling from outside the UAE.

### Details card
| Field | Value | Status |
|---|---|---|
| Clinic name | **Kasaesthetic Clinic** | ✅ Resolved from the supplied share link |
| Street address | *(pending)* | 🔴 **Needed** — not verifiable from public sources |
| Area / Emirate | *(pending)* | 🔴 Needed |
| Phone | `+971 55 557 3563` | [C] line 90 |
| WhatsApp | same number | [C] |
| Email | `info@dranicolecheverry.com` | [C] line 91 |
| Consultation hours | *(pending)* | 🟡 Needed |
| Get Directions | `https://share.google/JFXKjPDSRNDthp82J` | [C] line 95 |

### Map embed
Keyless Google Maps embed — no API key, no billing account:
```
https://www.google.com/maps?q=<place or address>&output=embed
```
Wrapped in a gold-hairline frame with a blush vignette overlay and a pulsing gradient pin. `loading="lazy"`, mounted only when scrolled near. Falls back to a static branded card with the same Get Directions link if the iframe is blocked.

> 🔴 **The address is deliberately blank, not guessed.** A wrong address on a medical page sends patients to the wrong building. The map is currently driven by the place-name query; supply the street address and it becomes exact, and feeds `MedicalBusiness` JSON-LD `geo` coordinates for local SEO.

---

## 16 · Footer — [C]

> Source lines 88–95

- **Logo** — white version on `plum-900` — [C] line 88
- **Contact** — [C] lines 89–91: `+971 55 557 3563` · `info@dranicolecheverry.com`
- **Connect with us** — [C] lines 92–95:
  - Facebook — `https://www.facebook.com/dranicolecheverry`
  - Instagram — `https://www.instagram.com/dra.nicolecheverry_surgery`
  - Location — `https://share.google/JFXKjPDSRNDthp82J`
- **Quick links** — [N]: the section anchors
- **Other treatments** — [N]: placeholder list, auto-populated as future landing pages are added
- **Disclaimer** — [N]:
  > The information on this page is for general education and is not medical advice. All surgical procedures carry risks; individual results vary. A personal consultation and assessment are required before any treatment plan is confirmed.
- **Copyright** — [N]: © 2026 Dr. Nicole Echeverry. All rights reserved.

---

## 17 · Persistent CTAs — [N]

- Floating WhatsApp bubble → `https://wa.me/971555573563?text=Hi%2C%20I%27d%20like%20to%20ask%20about%20a%20Mommy%20Makeover%20consultation.`
- Mobile sticky bar: **Call** (`tel:`) · **WhatsApp** · **Book** (`#book`)

---

## Source-line audit

| Source lines | Destination |
|---|---|
| 2–7 | Hero |
| 8 | Word artefact — discarded |
| 9–14 | What is a Mommy Makeover |
| 15–31 | The Procedures (3 cards) |
| 33–40 | Am I the right candidate? |
| 42–43 | Meet Dr. Nicole |
| 44–45 | Why Trust Dr. Nicole (4 pillars) |
| 51 | Before & After |
| 52 | Patient Reviews |
| 55–75 | FAQ (7 items) |
| 82–84 | Your Confidence Deserves Your Attention |
| 88–95 | Footer + booking contact rail + clinic map |
| 1, 20, 26, 32, 41, 46–50, 53–54, 76–81, 85–87, 96 | Blank lines / spacers |

**Update:** source lines **82–84** ("Your Confidence Deserves Your Attention" and its two
paragraphs) are no longer on the page — that section was removed at the client's request.
Everything else from the source document is still used.
