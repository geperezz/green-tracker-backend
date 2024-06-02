import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { evidenceUniqueTraitSchema } from '../schemas/evidence-unique-trait.schema';

export const evidenceUniqueTraitDtoSchema = evidenceUniqueTraitSchema;

type InferredEvidenceUniqueTraitDto = z.infer<
  typeof evidenceUniqueTraitDtoSchema
>;

export class EvidenceUniqueTraitDto extends createZodDto(
  evidenceUniqueTraitDtoSchema,
) {
  activityId: InferredEvidenceUniqueTraitDto['activityId'] = super.activityId;
  evidenceNumber: InferredEvidenceUniqueTraitDto['evidenceNumber'] = super
    .evidenceNumber;
}
