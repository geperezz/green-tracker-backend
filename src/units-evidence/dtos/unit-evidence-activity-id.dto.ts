import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { activityDtoSchema } from 'src/activities/dtos/activity.dto';

export const unitEvidenceActivityIdDtoSchema = z.object({
  activityId: activityDtoSchema.shape.id,
});

type InferredUnitEvidenceActivityIdDto = z.infer<
  typeof unitEvidenceActivityIdDtoSchema
>;

export class UnitEvidenceActivityIdDto extends createZodDto(
  unitEvidenceActivityIdDtoSchema,
) {
  activityId: InferredUnitEvidenceActivityIdDto['activityId'] = super
    .activityId;
}
