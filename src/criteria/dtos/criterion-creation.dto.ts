import { createZodDto } from 'nestjs-zod';

import { criterionDtoSchema } from './criterion.dto';

export const criterionCreationDtoSchema = criterionDtoSchema.omit({
  indicatorIndex: true,
});

export class CriterionCreationDto extends createZodDto(
  criterionCreationDtoSchema,
) {}
