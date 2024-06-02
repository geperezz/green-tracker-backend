import { createZodDto } from 'nestjs-zod';

import { criterionDtoSchema } from './criterion.dto';

export const criterionCreationBodyDtoSchema = criterionDtoSchema.omit({
  indicatorIndex: true,
});

export class CriterionCreationBodyDto extends createZodDto(
  criterionCreationBodyDtoSchema,
) {}
