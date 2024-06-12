import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { recommendedCategorySchema } from 'src/recommended-categories/schemas/recommended-category.schema';
import { userCreationDtoSchema } from 'src/users/dtos/user-creation.dto';

export const unitCreationDtoSchema = userCreationDtoSchema
  .omit({
    role: true,
  })
  .extend({
    recommendedCategories: z
      .array(recommendedCategorySchema.omit({ unitId: true }))
      .min(1),
  });

export class UnitCreationDto extends createZodDto(unitCreationDtoSchema) {}
