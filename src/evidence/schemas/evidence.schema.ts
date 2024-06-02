import { z } from 'nestjs-zod/z';

import { evidenceType } from '../evidence.table';

export const evidenceSchema = z.object({
  activityId: z.string().uuid(),
  evidenceNumber: z.coerce.number().int().min(0),
  link: z.string().trim().min(0),
  description: z.string().trim().min(0),
  uploadTimestamp: z.coerce.date(),
  type: z.enum(evidenceType.enumValues),
});

export const Evidence = evidenceSchema.brand('Evidence');
export type Evidence = z.infer<typeof Evidence>;
