import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { evidenceUniqueTraitSchema } from 'src/evidence/schemas/evidence-unique-trait.schema';

export const unitEvidenceUniqueTraitDtoSchema = evidenceUniqueTraitSchema;

type InferredUnitEvidenceUniqueTraitDto = z.infer<
  typeof unitEvidenceUniqueTraitDtoSchema
>;

export class UnitEvidenceUniqueTraitDto extends createZodDto(
  unitEvidenceUniqueTraitDtoSchema,
) {
  activityId: InferredUnitEvidenceUniqueTraitDto['activityId'] = super
    .activityId;
  evidenceNumber: InferredUnitEvidenceUniqueTraitDto['evidenceNumber'] = super
    .evidenceNumber;
}
