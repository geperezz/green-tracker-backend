import { createZodDto } from 'nestjs-zod';

import { activityDtoSchema } from './activity.dto';

export const activityCreationDtoSchema = activityDtoSchema;

export class ActivityCreationDto extends createZodDto(
  activityCreationDtoSchema,
) {}
