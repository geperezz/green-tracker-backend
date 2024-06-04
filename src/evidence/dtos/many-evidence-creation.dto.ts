import { z } from 'nestjs-zod/z';

import { evidenceCreationDtoSchema } from './evidence-creation.dto';

export const manyEvidenceCreationDtoSchema = z.object({
  evidenceToCreate: z.array(evidenceCreationDtoSchema).min(1),
});

export const ManyEvidenceCreationDto = manyEvidenceCreationDtoSchema.brand(
  'ManyEvidenceCreationDto',
);
export type ManyEvidenceCreationDto = z.infer<typeof ManyEvidenceCreationDto>;
