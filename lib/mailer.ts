import nodemailer, { type Transporter } from 'nodemailer';
import { site } from '@/content/site';

/**
 * Enquiry delivery over SMTP.
 *
 * Runtime configuration, not build-time: this runs inside `/api/consultation`,
 * which is a real server route. Changing an address or rotating the password is
 * an `.env` edit and a container restart — no rebuild, and nothing secret ever
 * reaches the browser or the repository.
 *
 *   SMTP_USER     the mailbox to authenticate as
 *   SMTP_PASS     app password (never the account password)
 *   ENQUIRY_TO    comma-separated recipients
 *   SMTP_HOST     optional, defaults to Gmail
 *   SMTP_PORT     optional, defaults to 465 (implicit TLS)
 */

const HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const PORT = Number(process.env.SMTP_PORT || 465);
const USER = process.env.SMTP_USER || '';
const PASS = process.env.SMTP_PASS || '';

const RECIPIENTS = (process.env.ENQUIRY_TO || '')
  .split(',')
  .map((address) => address.trim())
  .filter(Boolean);

export const mailerConfigured = Boolean(USER && PASS && RECIPIENTS.length);

/**
 * One transport for the process, not one per request.
 *
 * nodemailer pools connections on a transport; creating one per enquiry means a
 * fresh TLS handshake and a fresh SMTP AUTH every time, and Gmail rate-limits
 * authentication attempts far more aggressively than it rate-limits messages.
 */
let transport: Transporter | null = null;

function getTransport(): Transporter {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465,
      auth: { user: USER, pass: PASS },
      pool: true,
      maxConnections: 1,
    });
  }
  return transport;
}

export type Enquiry = {
  name: string;
  phone: string;
  email: string;
  slug: string;
  gclid?: string;
  gclidSource?: string;
  receivedAt: string;
};

/**
 * The page's display name, resolved from the slug ON THE SERVER.
 *
 * The client sends a slug, never the label that ends up in the subject line.
 * Putting caller-supplied text into a subject is how a bot writes its own
 * headline into the clinic's inbox — and, with a newline, its own headers.
 * Unknown slugs fall back to the slug itself, which is still bounded by the
 * schema's length limit and pattern.
 */
function pageLabel(slug: string): string {
  return site.landingPages.find((page) => page.slug === slug)?.title ?? slug;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export async function sendEnquiry(enquiry: Enquiry): Promise<void> {
  const label = pageLabel(enquiry.slug);

  const rows: Array<[string, string]> = [
    ['Name', enquiry.name],
    ['Phone', enquiry.phone],
    ['Email', enquiry.email],
    ['Page', `${label} (/${enquiry.slug})`],
    ['Received', new Date(enquiry.receivedAt).toUTCString()],
  ];

  if (enquiry.gclid) {
    rows.push(['Google click ID', `${enquiry.gclid} (${enquiry.gclidSource || 'gclid'})`]);
  }

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;color:#3a2430">
      <p style="margin:0 0 16px">New consultation request from the <strong>${escapeHtml(label)}</strong> page.</p>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
        ${rows
          .map(
            ([k, v]) =>
              `<tr>
                 <td style="border:1px solid #f5d9e5;background:#fdf2f7;font-weight:600">${escapeHtml(k)}</td>
                 <td style="border:1px solid #f5d9e5">${escapeHtml(v)}</td>
               </tr>`,
          )
          .join('')}
      </table>
      <p style="margin:16px 0 0;font-size:13px;color:#7a5a65">
        Reply to this email to answer ${escapeHtml(enquiry.name)} directly.
      </p>
    </div>`;

  await getTransport().sendMail({
    // Gmail rewrites From to the authenticated mailbox regardless, so claiming
    // anything else here only produces a mismatch that spam filters notice.
    from: `${site.doctor.name} Website <${USER}>`,
    to: RECIPIENTS,
    // Lets the team answer the patient by hitting reply, rather than
    // copying the address out of the body.
    replyTo: `${enquiry.name} <${enquiry.email}>`,
    subject: `[${label}] New consultation request — ${enquiry.name}`,
    text,
    html,
  });
}
