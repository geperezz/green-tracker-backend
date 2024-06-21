import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { recommendedCategorySchema } from 'src/recommended-categories/schemas/recommended-category.schema';

import { userDtoSchema } from 'src/users/dtos/user.dto';

export const unitDtoSchema = userDtoSchema.omit({ role: true }).extend({
  recommendedCategories: z
    .array(recommendedCategorySchema.omit({ unitId: true }))
    .min(1),
  contributedCategories: z.array(
    recommendedCategorySchema.omit({ unitId: true }),
  ),
});

export class UnitDto extends createZodDto(unitDtoSchema) {}
