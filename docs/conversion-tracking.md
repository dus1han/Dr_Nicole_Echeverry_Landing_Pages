# Conversion Tracking — setup guide

Everything on the site side is built. This is what the marketing team does to make
Google Ads count a conversion.

**No Google Ads or GA4 identifier lives in this repository.** The site only announces
*"a lead was submitted"*; GTM decides who hears about it. Adding Meta Pixel, TikTok or
GA4 later needs no code change and no deploy.

---

## 1 · Switch it on

Add one environment variable in Vercel — **Project → Settings → Environment Variables**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` |

Redeploy. Until this is set, the container simply does not render — no requests, no
errors, nothing to clean up. The site works exactly the same without it.

Create a container at [tagmanager.google.com](https://tagmanager.google.com) if you
don't have one: **Account → Container → Web**.

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

## 3 · Tags to create in GTM

### a. Conversion Linker — do not skip this
**Tag type:** Conversion Linker · **Trigger:** All Pages

Without it, Google Ads cannot read the click ID it set when the visitor arrived, and
conversions get attributed to "direct" instead of to the ad that paid for them. It is the
single most commonly forgotten tag in a Google Ads setup.

### b. Google Ads Conversion Tracking
1. In Google Ads: **Goals → Conversions → New conversion action → Website**
2. Category **Submit lead form**, count **One** per click
3. Copy the **Conversion ID** (`AW-…`) and **Conversion Label**
4. In GTM, create the tag with those two values
5. **Trigger:** Custom Event, event name `generate_lead`

### c. GA4 event (optional)
**Tag type:** GA4 Event · **Event name:** `generate_lead` · same trigger.
GA4 already treats `generate_lead` as a recommended event name, so it reports cleanly.

---

## 4 · Why a custom event, not a URL rule

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

## 5 · Testing

1. GTM → **Preview**, enter the site URL
2. Submit a test enquiry
3. On the thank-you page you should see `generate_lead` in the event stream, with the
   Google Ads tag firing on it
4. Refresh the thank-you page — the event must **not** fire again

Google Ads' own status takes a few hours to move to "Recording conversions", so trust
Preview, not the dashboard, on the day.

An automated check covers this end to end:

```bash
node scripts/check-conversion-flow.mjs http://localhost:3000
```

It verifies click-ID capture (including the iOS `wbraid` / `gbraid` variants), the
redirect, the event firing exactly once, the flag clearing, and that neither a refresh
nor a direct visit fires anything.

---

## 6 · Click IDs are already being captured

`gclid` — plus `wbraid` and `gbraid`, which Google substitutes on iOS — is read from the
landing URL, stored for 90 days, and submitted with the enquiry.

Nothing uses it yet. It is there so the clinic can later import **offline conversions**:
telling Google Ads which enquiries became real consultations. That is the difference
between bidding for form fills and bidding for patients, and it cannot be backfilled —
the click ID has to be captured at the time.

---

## 7 · Still outstanding

| | |
|---|---|
| 🔴 **Lead delivery** | `deliver()` in `app/api/consultation/route.ts` still only logs. Conversions will be reported for enquiries nobody receives until this is wired to an inbox. |
| 🟡 **Consent Mode v2** | Required for EEA visitors. Without it their conversions may not be counted. Needs a consent banner feeding GTM's consent settings. |
