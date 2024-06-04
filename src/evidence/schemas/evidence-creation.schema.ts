import { z } from 'nestjs-zod/z';

import { evidenceSchema } from './evidence.schema';

export const evidenceCreationSchema = evidenceSchema.extend({
  evidenceNumber: evidenceSchema.shape.evidenceNumber.optional(),
});

export const EvidenceCreation =
  evidenceCreationSchema.brand('EvidenceCreation');
export type EvidenceCreation = z.infer<typeof EvidenceCreation>;
