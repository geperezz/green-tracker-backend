import { createZodDto } from 'nestjs-zod';

import { categoryDtoSchema } from './category.dto';

export const categoryCreationBodyDtoSchema = categoryDtoSchema.omit({
  indicatorIndex: true,
});

export class CategoryCreationBodyDto extends createZodDto(
  categoryCreationBodyDtoSchema,
) {}
