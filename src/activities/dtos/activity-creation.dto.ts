import { createZodDto } from 'nestjs-zod';

import { activityDtoSchema } from './activity.dto';

export const activityCreationDtoSchema = activityDtoSchema.extend({
  id: activityDtoSchema.shape.id.optional(),
});

export class ActivityCreationDto extends createZodDto(
  activityCreationDtoSchema,
) {}
