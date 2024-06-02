import { createZodDto } from 'nestjs-zod';

import { criterionCreationDtoSchema } from './criterion-creation.dto';

export const criterionReplacementDtoSchema = criterionCreationDtoSchema.omit({
  indicatorIndex: true,
});

export class CriterionReplacementDto extends createZodDto(
  criterionReplacementDtoSchema,
) {}
