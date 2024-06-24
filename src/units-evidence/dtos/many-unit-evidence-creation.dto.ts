import { z } from 'nestjs-zod/z';

import { unitEvidenceCreationDtoSchema } from './unit-evidence-creation.dto';

export const manyUnitEvidenceCreationDtoSchema = z.object({
  evidenceToCreate: z.array(unitEvidenceCreationDtoSchema).min(1),
});

export const ManyUnitEvidenceCreationDto =
  manyUnitEvidenceCreationDtoSchema.brand('ManyUnitEvidenceCreationDto');
export type ManyUnitEvidenceCreationDto = z.infer<
  typeof ManyUnitEvidenceCreationDto
>;
