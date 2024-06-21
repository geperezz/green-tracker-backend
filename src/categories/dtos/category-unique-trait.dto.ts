import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { categoryUniqueTraitSchema } from '../schemas/category-unique-trait.schema';

export const categoryUniqueTraitDtoSchema = categoryUniqueTraitSchema;

type InferredCategoryUniqueTraitDto = z.infer<
  typeof categoryUniqueTraitDtoSchema
>;

export class CategoryUniqueTraitDto extends createZodDto(
  categoryUniqueTraitDtoSchema,
) {
  indicatorIndex: InferredCategoryUniqueTraitDto['indicatorIndex'] = super
    .indicatorIndex;
  name: InferredCategoryUniqueTraitDto['name'] = super.name;
}
