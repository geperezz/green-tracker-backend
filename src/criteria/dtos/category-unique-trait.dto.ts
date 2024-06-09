import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { categoryDtoSchema } from 'src/categories/dtos/category.dto';

export const categoryUniqueTraitDtoSchema = z.object({
    categoryName: categoryDtoSchema.shape.name,
  });

type InferredCategoryUniqueTraitDto = z.infer<
  typeof categoryUniqueTraitDtoSchema
>;

export class CategoryUniqueTraitDto extends createZodDto(
  categoryUniqueTraitDtoSchema,
) {
    categoryName: InferredCategoryUniqueTraitDto['categoryName'] = super.categoryName;
}
