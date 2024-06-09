import { createZodDto } from 'nestjs-zod';

import { criterionCreationDtoSchema } from './criterion-creation.dto';

export const criterionCreationBodyDtoSchema = criterionCreationDtoSchema.omit({
  indicatorIndex: true,
});

export class CriterionCreationBodyDto extends createZodDto(
  criterionCreationBodyDtoSchema,
) {}
