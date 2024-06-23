import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { indicatorSchema } from '../schemas/indicator.schema';
import { categoryDtoSchema } from 'src/categories/dtos/category.dto';

export const indicatorDtoSchema = indicatorSchema.extend({
  categories: z.array(categoryDtoSchema),
});

export class IndicatorDto extends createZodDto(indicatorDtoSchema) {}
