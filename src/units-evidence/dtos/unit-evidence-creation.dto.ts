import { z } from 'nestjs-zod/z';

import { evidenceCreationSchema } from 'src/evidence/schemas/evidence-creation.schema';

export const unitEvidenceCreationDtoSchema = evidenceCreationSchema;

export const UnitEvidenceCreationDto = unitEvidenceCreationDtoSchema.brand(
  'UnitEvidenceCreationDto',
);
export type UnitEvidenceCreationDto = z.infer<typeof UnitEvidenceCreationDto>;
