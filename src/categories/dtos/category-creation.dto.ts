import { createZodDto } from 'nestjs-zod';

import { categoryDtoSchema } from './category.dto';
import { z } from 'nestjs-zod/z';
import { criterionSchema } from 'src/criteria/schemas/criterion.schema';

export const categoryCreationDtoSchema = categoryDtoSchema
  .omit({
    indicatorIndex: true,
  })
  .extend({
    criteria: z.array(criterionSchema.pick({ subindex: true })),
  });

export class CategoryCreationDto extends createZodDto(
  categoryCreationDtoSchema,
) {}
