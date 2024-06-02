import { z } from 'nestjs-zod/z';

import { evidenceCreationSchema } from './evidence-creation.schema';

export const evidenceReplacementSchema = evidenceCreationSchema;

export const EvidenceReplacement = evidenceReplacementSchema.brand(
  'EvidenceReplacement',
);
export type EvidenceReplacement = z.infer<typeof EvidenceReplacement>;
