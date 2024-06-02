import { createZodDto } from 'nestjs-zod';

import { categoryDtoSchema } from './category.dto';
import { z } from 'nestjs-zod/z';

export const categoryIndicatorIndexDtoSchema = categoryDtoSchema.pick({
  indicatorIndex: true,
});

type InferredCategoryIndicatorIndexDto = z.infer<typeof categoryIndicatorIndexDtoSchema>;

export class CategoryIndicatorIndexDto extends createZodDto(
  categoryIndicatorIndexDtoSchema,
) {
  indicatorIndex: InferredCategoryIndicatorIndexDto['indicatorIndex'] = super
    .indicatorIndex;
}