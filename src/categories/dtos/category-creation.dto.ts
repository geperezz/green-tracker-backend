import { createZodDto } from 'nestjs-zod';

import { categoryDtoSchema } from './category.dto';

export const categoryCreationDtoSchema = categoryDtoSchema;

export class CategoryCreationDto extends createZodDto(
  categoryCreationDtoSchema,
) {}
