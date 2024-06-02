import { createZodDto } from 'nestjs-zod';

import { criterionDtoSchema } from './criterion.dto';
import { z } from 'nestjs-zod/z';

export const criterionIndicatorIndexDtoSchema = criterionDtoSchema.pick({
  indicatorIndex: true,
});

type InferredCriterionIndicatorIndexDto = z.infer<typeof criterionIndicatorIndexDtoSchema>;

export class CriterionIndicatorIndexDto extends createZodDto(
  criterionIndicatorIndexDtoSchema,
) {
  indicatorIndex: InferredCriterionIndicatorIndexDto['indicatorIndex'] = super
    .indicatorIndex;
}
