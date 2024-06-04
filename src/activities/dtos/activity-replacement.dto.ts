import { createZodDto } from 'nestjs-zod';

import { activityCreationDtoSchema } from './activity-creation.dto';

export const activityReplacementDtoSchema = activityCreationDtoSchema;

export class ActivityReplacementDto extends createZodDto(
  activityReplacementDtoSchema,
) {}
