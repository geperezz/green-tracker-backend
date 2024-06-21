import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { categoryFiltersSchema } from '../schemas/category-filters.schema';

export const categoryFiltersDtoSchema = categoryFiltersSchema.omit({
  indicatorIndex: true,
});

type InferredCategoryFiltersDto = z.infer<typeof categoryFiltersDtoSchema>;

export class CategoryFiltersDto extends createZodDto(categoryFiltersDtoSchema) {
  name?: InferredCategoryFiltersDto['name'] = super.name;
}
