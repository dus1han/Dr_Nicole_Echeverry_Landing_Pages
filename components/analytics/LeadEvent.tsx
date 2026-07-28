'use client';

import { useEffect } from 'react';
import { LEAD_EVENT, LEAD_FLAG, pushDataLayer } from '@/lib/analytics';

/**
 * Fires the conversion signal on the thank-you page — once, and only after a
 * genuine submission.
 *
 * It checks for a flag set by the booking form and clears it immediately, so a
 * refresh, a back-button, a bookmark or a shared link cannot fire a second
 * conversion. Inflated conversion counts are worse than none: Google's bidding
 * optimises toward whatever you report, so false positives actively spend the
 * clinic's budget in the wrong direction.
 *
 * If GTM is not configured, `pushDataLayer` simply appends to an array nobody
 * reads. Nothing breaks.
 */
export function LeadEvent() {
  useEffect(() => {
    let submitted = false;
    try {
      submitted = window.sessionStorage.getItem(LEAD_FLAG) === '1';
      if (submitted) window.sessionStorage.removeItem(LEAD_FLAG);
    } catch {
      // Storage blocked. Better to miss a conversion than to fire a false one.
      return;
    }

    if (!submitted) return;

    pushDataLayer({
      event: LEAD_EVENT,
      form_name: 'consultation_request',
      form_location: 'mommy-makeover',
    });
  }, []);

  return null;
}
