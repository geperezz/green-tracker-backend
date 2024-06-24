import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { activityFiltersSchema } from 'src/activities/schemas/activity-filters.schema';

export const unitActivityFiltersDtoSchema = activityFiltersSchema.omit({
  unitId: true,
});

type InferredUnitActivityFiltersDto = z.infer<
  typeof unitActivityFiltersDtoSchema
>;

export class UnitActivityFiltersDto extends createZodDto(
  unitActivityFiltersDtoSchema,
) {
  id?: InferredUnitActivityFiltersDto['id'] = super.id;
  name?: InferredUnitActivityFiltersDto['name'] = super.name;
  summary?: InferredUnitActivityFiltersDto['summary'] = super.summary;
  uploadTimestamp?: InferredUnitActivityFiltersDto['uploadTimestamp'] = super
    .uploadTimestamp;
  indicatorIndex?: InferredUnitActivityFiltersDto['indicatorIndex'] = super
    .indicatorIndex;
  categoryName?: InferredUnitActivityFiltersDto['categoryName'] = super
    .categoryName;
}
