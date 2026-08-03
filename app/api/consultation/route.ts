import { NextResponse } from 'next/server';
import { consultationSchema } from '@/lib/consultation-schema';
import { sendEnquiry, mailerConfigured } from '@/lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Consultation enquiries — validated, rate-limited, then emailed.
 *
 * Delivery is configured at runtime (see lib/mailer.ts), so the destination
 * addresses and the sending credentials live in the server's `.env` rather than
 * in this repository, which is public.
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

/**
 * Never let an enquiry exist only inside a failed network call.
 *
 * Printed before delivery is attempted, so if SMTP is down the details survive
 * in `docker compose logs web` and someone can still phone the patient back.
 * A lost lead is worse than a noisy log.
 */
function logEnquiry(prefix: string, enquiry: Record<string, unknown>) {
  const { gclid, ...rest } = enquiry;
  console.info(prefix, { ...rest, gclid: gclid ? '(captured)' : '' });
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

  const { website: _honeypot, ...rest } = parsed.data;
  const enquiry = { ...rest, receivedAt: new Date().toISOString() };

  logEnquiry('[consultation] enquiry received:', enquiry);

  if (!mailerConfigured) {
    /*
     * Local development, or a server missing SMTP_USER / SMTP_PASS /
     * ENQUIRY_TO. Say so loudly and at warn level: the visitor sees a success
     * screen and a conversion fires, so from every other angle this looks like
     * it worked. The enquiry is in the log above either way.
     */
    console.warn(
      '[consultation] SMTP NOT CONFIGURED — nothing was emailed. ' +
        'Set SMTP_USER, SMTP_PASS and ENQUIRY_TO to deliver enquiries.',
    );
    return NextResponse.json({ ok: true });
  }

  try {
    await sendEnquiry(enquiry);
    console.info('[consultation] delivered');
  } catch (err) {
    console.error('[consultation] DELIVERY FAILED — enquiry is in the log above:', err);
    /*
     * Deliberately an error rather than a quiet success. If the clinic will not
     * receive this, the visitor needs to know now, while the phone and WhatsApp
     * buttons are still in front of her — a false "thank you" loses the patient
     * and the enquiry together.
     */
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
