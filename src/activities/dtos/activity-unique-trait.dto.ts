import { createZodDto } from 'nestjs-zod';

import { activityDtoSchema } from './activity.dto';
import { z } from 'nestjs-zod/z';

export const activityUniqueTraitDtoSchema = activityDtoSchema.pick({
  id: true,
});

type InferredActivityUniqueTraitDto = z.infer<
  typeof activityUniqueTraitDtoSchema
>;

export class ActivityUniqueTraitDto extends createZodDto(
  activityUniqueTraitDtoSchema,
) {
  id: InferredActivityUniqueTraitDto['id'] = super.id;
}
