import { createZodDto } from 'nestjs-zod';

import { criterionDtoSchema } from './criterion.dto';
import { z } from 'nestjs-zod/z';

export const criterionCreationPathDtoSchema = criterionDtoSchema.pick({
  indicatorIndex: true
});

type InferredCriterionCreationPathDto = z.infer<typeof criterionCreationPathDtoSchema>;

export class CriterionCreationPathDto extends createZodDto(
  criterionCreationPathDtoSchema,
) {
  indicatorIndex: InferredCriterionCreationPathDto['indicatorIndex'] = super
    .indicatorIndex;
}
