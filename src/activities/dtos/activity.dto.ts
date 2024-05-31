import { createZodDto } from 'nestjs-zod';

import { Activity, activitySchema } from '../schemas/activity.schema';

export const activityDtoSchema = activitySchema;

export class ActivityDto extends createZodDto(activityDtoSchema) {
  static fromSchema(schema: Activity): ActivityDto {
    return activityDtoSchema.parse(schema);
  }
}
