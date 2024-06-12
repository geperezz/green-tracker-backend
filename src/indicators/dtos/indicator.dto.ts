import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { indicatorSchema } from '../schemas/indicator.schema';
import { categoryDtoSchema } from 'src/categories/dtos/category.dto';
import { criterionDtoSchema } from 'src/criteria/dtos/criterion.dto';

export const indicatorDtoSchema = indicatorSchema.extend({
  categories: z.array(
    categoryDtoSchema.omit({ indicatorIndex: true }).extend({
      criteria: z.array(criterionDtoSchema.omit({ indicatorIndex: true })),
    }),
  ),
});

export class IndicatorDto extends createZodDto(indicatorDtoSchema) {}
