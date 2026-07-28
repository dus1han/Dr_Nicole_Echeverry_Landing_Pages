# Conversion Tracking — setup guide

Everything on the site side is built. This is what the marketing team does to make
Google Ads count a conversion.

**No Google Ads or GA4 identifier lives in this repository.** The site only announces
*"a lead was submitted"*; GTM decides who hears about it. Adding Meta Pixel, TikTok or
GA4 later needs no code change and no deploy.

---

## 1 · Create the GTM container

1. Go to [tagmanager.google.com](https://tagmanager.google.com) and sign in with the
   Google account that owns (or will own) the Google Ads account.
2. **Create Account**
   - Account Name: `Dr. Nicole Echeverry`
   - Country: `United Arab Emirates`
   - Container name: `dranicolecheverry.com`
   - Target platform: **Web**
3. **Create** → accept the terms.
4. A dialog appears with two code snippets. **Ignore them — both are already in the
   site.** You only need the ID at the top: `GTM-XXXXXXX`. Copy it.

---

## 2 · Switch it on in Vercel

1. Vercel → your project → **Settings → Environment Variables**
2. Add:

   | Key | Value | Environments |
   |---|---|---|
   | `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | Production, Preview, Development |

3. **Redeploy.**

> ⚠️ **The redeploy is not optional.** `NEXT_PUBLIC_*` variables are baked into the
> JavaScript at build time, not read at runtime. Saving the variable changes nothing
> until a new build runs. Vercel → **Deployments → ⋯ → Redeploy**.

**Verify it worked:** open the live page, view source (Ctrl-U), search for `GTM-`.
You should see your ID. If not, the redeploy hasn't happened.

Until the variable is set the container does not render at all — no requests, no errors.
The site behaves identically without it.

---

## 2 · What the site sends

On a successful submission the visitor is taken to
`/mommy-makeover/thank-you`, and this is pushed to the dataLayer:

```js
{
  event: 'generate_lead',
  form_name: 'consultation_request',
  form_location: 'mommy-makeover'
}
```

That is the whole contract. Build every tag against it.

---

## 3 · Create the conversion action in Google Ads

1. Google Ads → **Goals → Conversions → Summary → + New conversion action**
2. Choose **Website**
3. Enter `dranicolecheverry.com` → **Scan**
4. When the scan finishes, choose **+ Add a conversion action manually**
5. Fill in:

   | Field | Value |
   |---|---|
   | Goal and action optimisation | **Submit lead form** |
   | Conversion name | `Consultation request` |
   | Value | *Don't use a value* — or set one if the clinic knows a lead's worth |
   | Count | **One** ← important; a person only becomes a patient once |
   | Click-through conversion window | 30 days |
   | Attribution model | Data-driven |

6. **Done → Save and continue**
7. On the next screen choose **Use Google Tag Manager**
8. It shows a **Conversion ID** (`AW-…`) and a **Conversion label**. Keep this tab open —
   you need both in the next step.

---

## 4 · Create the trigger in GTM

**Triggers → New → Trigger Configuration → Custom Event**

| Field | Value |
|---|---|
| Event name | `generate_lead` |
| This trigger fires on | All Custom Events |

Name it `Lead — generate_lead` → **Save**.

---

## 5 · Create the two tags in GTM

### a. Conversion Linker — do not skip this

**Tags → New → Tag Configuration → Conversion Linker**
**Trigger:** All Pages. Name it `Google Ads — Conversion Linker` → Save.

Without it Google Ads cannot read the click ID stored when the visitor arrived, so
conversions get attributed to "direct" rather than to the ad that paid for them. It is
the single most commonly forgotten tag in a Google Ads setup, and everything appears to
work while quietly mis-attributing.

### b. Google Ads Conversion Tracking

**Tags → New → Tag Configuration → Google Ads Conversion Tracking**

| Field | Value |
|---|---|
| Conversion ID | from step 3 |
| Conversion Label | from step 3 |

**Trigger:** `Lead — generate_lead`. Name it `Google Ads — Consultation Lead` → Save.

### c. GA4 event (optional)

**Tag type:** Google Analytics: GA4 Event · **Event name:** `generate_lead` · same
trigger. GA4 already treats `generate_lead` as a recommended event name, so it reports
without any custom configuration.

---

## Why a custom event, not a URL rule

You *can* point Google Ads at "any page load where the URL contains `/thank-you`", and
that will work. It also counts a conversion every time someone refreshes, presses back,
or opens a shared link.

The site sets a one-time flag on submit which the thank-you page reads, fires the event,
and clears. **One conversion per genuine enquiry.** Inflated counts are worse than no
counts — Google's bidding optimises toward whatever you report, so false positives spend
the budget in the wrong direction.

The URL still exists and is still testable, so a URL rule remains available if you prefer
it. The event is simply more accurate.

---

## 6 · Test before publishing

1. In GTM click **Preview** (top right)
2. Enter `https://dranicolecheverry.com/mommy-makeover` → **Connect**
3. The site opens in a new tab with Tag Assistant attached
4. Fill in the three fields and submit a real test enquiry
5. Switch to the Tag Assistant tab. In the left-hand event stream you should see:

   ```
   Container Loaded        → Conversion Linker fired
   generate_lead           → Google Ads — Consultation Lead fired
   ```

6. Click the `generate_lead` event → **Tags Fired** must list the conversion tag
7. **Now refresh the thank-you page.** No new `generate_lead` should appear — this is the
   guard against double-counting, and it is the step most people skip

If `generate_lead` never appears, the container isn't on the page — go back to step 2 and
confirm the redeploy happened.

---

## 7 · Publish

GTM → **Submit** → name the version (e.g. `Google Ads lead conversion`) → **Publish**.

Nothing is live until you publish. Preview mode only affects your own browser.

---

## 8 · Confirm in Google Ads

**Goals → Conversions** — the action's status moves from *"No recent conversions"* to
*"Recording conversions"*.

This can take **3–24 hours**. Do not judge the setup by this on the first day; Tag
Assistant in step 6 is the reliable signal.

---

## 9 · Automated check

```bash
node scripts/check-conversion-flow.mjs http://localhost:3000
```

Verifies click-ID capture (including the iOS `wbraid` / `gbraid` variants), the redirect,
the click ID reaching the API, the event firing exactly once with context, the flag
clearing, that neither a refresh nor a direct visit fires anything, and that the
thank-you page is `noindex`. 10 checks.

Run it after any change to the form or the thank-you page.

---

## Click IDs are already being captured

`gclid` — plus `wbraid` and `gbraid`, which Google substitutes on iOS — is read from the
landing URL, stored for 90 days, and submitted with the enquiry.

Nothing uses it yet. It is there so the clinic can later import **offline conversions**:
telling Google Ads which enquiries became real consultations. That is the difference
between bidding for form fills and bidding for patients, and it cannot be backfilled —
the click ID has to be captured at the time.

---

## Still outstanding

| | |
|---|---|
| 🔴 **Lead delivery** | `deliver()` in `app/api/consultation/route.ts` still only logs. Conversions will be reported for enquiries nobody receives until this is wired to an inbox. |
| 🟡 **Consent Mode v2** | Required for EEA visitors. Without it their conversions may not be counted. Needs a consent banner feeding GTM's consent settings. |
