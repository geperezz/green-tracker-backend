import { z } from 'nestjs-zod/z';

import { evidenceSchema } from './evidence.schema';

export const evidenceUniqueTraitSchema = evidenceSchema.pick({
  activityId: true,
  evidenceNumber: true,
});

export const EvidenceUniqueTrait = evidenceUniqueTraitSchema.brand(
  'EvidenceUniqueTrait',
);
export type EvidenceUniqueTrait = z.infer<typeof EvidenceUniqueTrait>;
