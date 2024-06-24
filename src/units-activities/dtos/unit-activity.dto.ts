import { createZodDto } from 'nestjs-zod';

import { activityDtoSchema } from 'src/activities/dtos/activity.dto';

export const unitActivityDtoSchema = activityDtoSchema.omit({ unitId: true });

export class UnitActivityDto extends createZodDto(unitActivityDtoSchema) {}
