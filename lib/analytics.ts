/**
 * Analytics plumbing.
 *
 * The site pushes events to the GTM dataLayer and nothing more — no Google Ads
 * IDs, no GA4 IDs, no pixel code lives in this repo. The marketing team wires
 * those up inside GTM against the events below, so adding or changing a pixel
 * never needs a code change or a deploy.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** The event GTM listens for to fire the Google Ads conversion. */
export const LEAD_EVENT = 'generate_lead';

/**
 * Set the moment a submission succeeds, read once on the thank-you page.
 *
 * sessionStorage, not a URL parameter: a query string would be shared,
 * bookmarked and refreshed, and each of those would fire another conversion.
 * This survives the navigation to /thank-you and nothing else.
 */
export const LEAD_FLAG = 'nme:lead-submitted';

/**
 * Where the ad click ID is kept between landing and submitting.
 * localStorage, so it survives if she reads the page today and enquires
 * tomorrow — Google's click IDs stay valid for far longer than a session.
 */
export const CLICK_ID_KEY = 'nme:click-id';

/** Google's click-ID parameters, in the order we prefer them. */
export const CLICK_ID_PARAMS = ['gclid', 'wbraid', 'gbraid'] as const;

/** 90 days — comfortably inside Google's attribution window. */
const CLICK_ID_TTL_MS = 90 * 24 * 60 * 60 * 1000;

type StoredClickId = { value: string; source: string; at: number };

export function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

/** Persist a click ID seen in the URL. Called once per page load. */
export function captureClickId(search: string): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(search);
  for (const key of CLICK_ID_PARAMS) {
    const value = params.get(key);
    if (!value) continue;
    try {
      const record: StoredClickId = { value, source: key, at: Date.now() };
      window.localStorage.setItem(CLICK_ID_KEY, JSON.stringify(record));
    } catch {
      // Private mode / storage disabled — tracking degrades, the form still works.
    }
    return; // first match wins
  }
}

/** Read a stored click ID, ignoring anything past the attribution window. */
export function readClickId(): { gclid: string; gclidSource: string } {
  const empty = { gclid: '', gclidSource: '' };
  if (typeof window === 'undefined') return empty;

  try {
    const raw = window.localStorage.getItem(CLICK_ID_KEY);
    if (!raw) return empty;

    const record = JSON.parse(raw) as StoredClickId;
    if (!record?.value || Date.now() - record.at > CLICK_ID_TTL_MS) {
      window.localStorage.removeItem(CLICK_ID_KEY);
      return empty;
    }
    return { gclid: record.value, gclidSource: record.source };
  } catch {
    return empty;
  }
}
