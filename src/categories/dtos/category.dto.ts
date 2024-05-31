import { createZodDto } from 'nestjs-zod';

import { Category, categorySchema } from '../schemas/category.schema';

export const categoryDtoSchema = categorySchema;

export class CategoryDto extends createZodDto(categoryDtoSchema) {
  static fromSchema(schema: Category): CategoryDto {
    return categoryDtoSchema.parse(schema);
  }
}
