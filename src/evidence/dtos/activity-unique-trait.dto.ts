import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { activityDtoSchema } from 'src/activities/dtos/activity.dto';

export const activityUniqueTraitDtoSchema = z.object({
  activityId: activityDtoSchema.shape.id,
});

type InferredActivityUniqueTraitDto = z.infer<
  typeof activityUniqueTraitDtoSchema
>;

export class ActivityUniqueTraitDto extends createZodDto(
  activityUniqueTraitDtoSchema,
) {
  activityId: InferredActivityUniqueTraitDto['activityId'] = super.activityId;
}
