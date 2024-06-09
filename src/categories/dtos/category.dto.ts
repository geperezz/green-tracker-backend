import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { categorySchema } from '../schemas/category.schema';
import { criterionDtoSchema } from 'src/criteria/dtos/criterion.dto';

export const categoryDtoSchema = categorySchema.extend({
  criteria: z.array(criterionDtoSchema).optional(),
});

export class CategoryDto extends createZodDto(categoryDtoSchema) {}
