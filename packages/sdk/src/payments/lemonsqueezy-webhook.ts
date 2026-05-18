// Cupel SDK — Lemon Squeezy webhook helpers
// Author: Aïssa BELKOUSSA

import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

const eventSchema = z.object({
  meta: z.object({
    event_name: z.string(),
    custom_data: z
      .object({
        user_id: z.string().uuid().optional(),
        skill_id: z.string().uuid().optional(),
        variant_id: z.string().optional(),
      })
      .optional(),
  }),
  data: z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.record(z.unknown()),
  }),
});

export type LemonSqueezyEvent = z.infer<typeof eventSchema>;

export function verifyLemonSqueezySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;
  const computed = createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signatureHeader, 'hex'));
  } catch {
    return false;
  }
}

export function parseLemonSqueezyEvent(rawBody: string): LemonSqueezyEvent {
  const parsed = JSON.parse(rawBody);
  return eventSchema.parse(parsed);
}
