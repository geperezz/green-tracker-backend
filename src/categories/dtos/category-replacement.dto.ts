import { createZodDto } from 'nestjs-zod';

import { categoryCreationDtoSchema } from './category-creation.dto';

export const categoryReplacementDtoSchema = categoryCreationDtoSchema;

export class CategoryReplacementDto extends createZodDto(
  categoryReplacementDtoSchema,
) {}
