import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { activitySchema } from '../schemas/activity.schema';
import { evidenceDtoSchema } from 'src/evidence/dtos/evidence.dto';

export const activityDtoSchema = activitySchema.extend({
  evidence: z.array(evidenceDtoSchema).min(1),
});

export class ActivityDto extends createZodDto(activityDtoSchema) {}
