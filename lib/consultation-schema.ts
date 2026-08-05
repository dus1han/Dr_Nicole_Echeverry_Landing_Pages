import { z } from 'zod';

/**
 * One schema, used on both sides: the form validates against it before
 * submitting, the API route validates against it before trusting anything.
 * Client-side validation is UX; the server copy is the actual guard.
 *
 * Reduced to three fields at the client's request — name, phone, email. The
 * interest chips, preferred-contact-time select and free-text message were
 * removed: every extra field on an enquiry form costs completions, and the
 * team can ask the rest on the call.
 */
export const consultationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please tell us your name.')
    .max(120, 'That name is a little too long.'),

  phone: z
    .string()
    .trim()
    .min(7, 'We’ll need a number we can reach you on.')
    .max(32, 'That number looks too long.')
    .regex(/^[+()\d\s-]+$/, 'Please use digits, spaces, + and - only.'),

  /**
   * Optional at the client's request — the phone number is the required
   * channel now.
   *
   * Still validated WHEN GIVEN. Accepting anything at all would mean the team
   * replies into the void, which is worse than not asking: the patient believes
   * she has been in touch and hears nothing back.
   */
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .default('')
    .refine((value) => value === '' || z.string().email().safeParse(value).success, {
      message: 'That email doesn’t look quite right.',
    }),

  /**
   * Which landing page the enquiry came from — it names the subject line, and
   * distinguishes leads once this app serves several campaigns.
   *
   * Constrained to a slug shape rather than accepted as free text. The server
   * maps it to a display name before it reaches the subject; a value that
   * cannot contain a newline cannot smuggle an extra mail header along with it.
   */
  slug: z
    .string()
    .trim()
    .max(64)
    .regex(/^[a-z0-9-]*$/, 'Unexpected page identifier.')
    .optional()
    .default(''),

  /**
   * Google Ads click ID captured on landing, carried through with the enquiry.
   *
   * Not used for anything today. It exists so the clinic can later import
   * offline conversions — telling Google Ads which enquiries became real
   * consultations — which is the difference between bidding for form fills and
   * bidding for patients. Cheap to collect now, impossible to backfill later.
   */
  gclid: z.string().max(200).optional().default(''),
  gclidSource: z.string().max(20).optional().default(''),

  /**
   * Honeypot — bots fill hidden fields, humans never see this one.
   *
   * Deliberately permissive: if the schema rejected a non-empty value, the
   * 422 response would name `website` in fieldErrors and hand a bot the exact
   * field to leave alone. Instead this always parses, and the route checks the
   * value and returns a silent success.
   */
  website: z.string().max(200).optional().default(''),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
