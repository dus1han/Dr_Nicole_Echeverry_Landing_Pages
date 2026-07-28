'use client';

import { useEffect } from 'react';
import { captureClickId } from '@/lib/analytics';

/**
 * Stores the Google Ads click ID from the landing URL.
 *
 * Runs once per page load and renders nothing. Handles `gclid` plus `wbraid`
 * and `gbraid`, which Google substitutes for iOS traffic — a setup that only
 * looks for `gclid` silently loses attribution on a large share of mobile ad
 * clicks.
 *
 * Kept so the enquiry can carry the click ID with it. That is what makes
 * offline conversion import possible later: the clinic can tell Google Ads
 * "this lead actually attended a consultation" and have it attributed to the
 * original ad, so bidding optimises toward real patients rather than form
 * fills.
 */
export function ClickIdCapture() {
  useEffect(() => {
    captureClickId(window.location.search);
  }, []);

  return null;
}
