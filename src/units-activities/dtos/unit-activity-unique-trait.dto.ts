import { createZodDto } from 'nestjs-zod';

import { unitActivityDtoSchema } from './unit-activity.dto';
import { z } from 'nestjs-zod/z';

export const unitActivityUniqueTraitDtoSchema = z.object({
  activityId: unitActivityDtoSchema.shape.id,
});

type InferredUnitActivityUniqueTraitDto = z.infer<
  typeof unitActivityUniqueTraitDtoSchema
>;

export class UnitActivityUniqueTraitDto extends createZodDto(
  unitActivityUniqueTraitDtoSchema,
) {
  activityId: InferredUnitActivityUniqueTraitDto['activityId'] = super
    .activityId;
}
