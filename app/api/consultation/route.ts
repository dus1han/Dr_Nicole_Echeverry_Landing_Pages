import { NextResponse } from 'next/server';
import { consultationSchema } from '@/lib/consultation-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Consultation enquiries.
 *
 * ⚠ NO DESTINATION IS WIRED UP YET — this validates, rate-limits and logs the
 * enquiry, then returns success. The client has not yet chosen where
 * submissions should go (inbox via Resend / Google Sheet / CRM).
 * See docs/open-questions.md §4. To finish it, replace `deliver()` below.
 *
 * Until then the page's WhatsApp and phone paths are the live conversion
 * routes, and they work today.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

/**
 * In-memory rate limit. Adequate for a single-instance deploy; on a
 * multi-instance or serverless host each instance keeps its own counter, so
 * move this to Upstash/Redis if the page ever sees real abuse.
 */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

async function deliver(data: Record<string, unknown>) {
  // TODO: wire to the client's chosen destination. Example (Resend):
  //
  //   await fetch('https://api.resend.com/emails', {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       from: 'Website <enquiries@dranicolecheverry.com>',
  //       to: process.env.ENQUIRY_INBOX,
  //       subject: `New consultation enquiry — ${data.name}`,
  //       text: JSON.stringify(data, null, 2),
  //     }),
  //   });

  console.info('[consultation] new enquiry (not yet delivered anywhere):', data);
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many enquiries. Please try again shortly, or call us.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = consultationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Please check the highlighted fields.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  // Honeypot tripped — accept silently so the bot doesn't learn it was caught.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { website: _honeypot, ...enquiry } = parsed.data;

  try {
    await deliver({ ...enquiry, receivedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[consultation] delivery failed:', err);
    return NextResponse.json(
      {
        ok: false,
        error: 'We couldn’t send that just now. Please WhatsApp or call us instead.',
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
