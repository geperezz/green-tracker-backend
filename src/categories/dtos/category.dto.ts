import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { categorySchema } from '../schemas/category.schema';
import { criterionSchema } from 'src/criteria/schemas/criterion.schema';

export const categoryDtoSchema = categorySchema.extend({
  criteria: z.array(
    criterionSchema.omit({ indicatorIndex: true, categoryName: true }),
  ),
});

export class CategoryDto extends createZodDto(categoryDtoSchema) {}
