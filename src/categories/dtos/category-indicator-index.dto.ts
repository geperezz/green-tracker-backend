import { createZodDto } from 'nestjs-zod';

import { z } from 'nestjs-zod/z';
import { indicatorSchema } from 'src/indicators/schemas/indicator.schema';

export const categoryIndicatorIndexDtoSchema = z.object({
  indicatorIndex: indicatorSchema.shape.index,
});

type InferredCategoryIndicatorIndexDto = z.infer<
  typeof categoryIndicatorIndexDtoSchema
>;

export class CategoryIndicatorIndexDto extends createZodDto(
  categoryIndicatorIndexDtoSchema,
) {
  indicatorIndex: InferredCategoryIndicatorIndexDto['indicatorIndex'] = super
    .indicatorIndex;
}
