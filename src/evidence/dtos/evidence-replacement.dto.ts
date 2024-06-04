import { z } from 'nestjs-zod/z';

import { evidenceCreationDtoSchema } from './evidence-creation.dto';

export const evidenceReplacementDtoSchema = evidenceCreationDtoSchema;

export const EvidenceReplacementDto = evidenceReplacementDtoSchema.brand(
  'EvidenceReplacementDto',
);
export type EvidenceReplacementDto = z.infer<typeof EvidenceReplacementDto>;
