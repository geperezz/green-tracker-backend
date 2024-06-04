import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { activityFiltersSchema } from '../schemas/activity-filters.schema';

export const activityFiltersDtoSchema = activityFiltersSchema;

type InferredActivityFiltersDto = z.infer<typeof activityFiltersDtoSchema>;

export class ActivityFiltersDto extends createZodDto(activityFiltersDtoSchema) {
  id?: InferredActivityFiltersDto['id'] = super.id;
  name?: InferredActivityFiltersDto['name'] = super.name;
  summary?: InferredActivityFiltersDto['summary'] = super.summary;
  uploadTimestamp?: InferredActivityFiltersDto['uploadTimestamp'] = super
    .uploadTimestamp;
  unitId?: InferredActivityFiltersDto['unitId'] = super.unitId;
  indicatorIndex?: InferredActivityFiltersDto['indicatorIndex'] = super
    .indicatorIndex;
  categoryName?: InferredActivityFiltersDto['categoryName'] = super
    .categoryName;
}
