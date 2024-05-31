import { createZodDto } from 'nestjs-zod';

import { categoryDtoSchema } from './category.dto';
import { z } from 'nestjs-zod/z';

export const categoryUniqueTraitDtoSchema = categoryDtoSchema.pick({
  indicatorIndex: true,
  name: true,
});

type InferredCategoryUniqueTraitDto = z.infer<
  typeof categoryUniqueTraitDtoSchema
>;

export class CategoryUniqueTraitDto extends createZodDto(
  categoryUniqueTraitDtoSchema,
) {
  indicatorIndex: InferredCategoryUniqueTraitDto['indicatorIndex'] = super.indicatorIndex;
  name: InferredCategoryUniqueTraitDto['name'] = super.name;
}
