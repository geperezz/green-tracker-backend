import { createZodDto } from 'nestjs-zod';

import { criterionCreationDtoSchema } from './criterion-creation.dto';

export const criterionReplacementDtoSchema = criterionCreationDtoSchema;

export class CriterionReplacementDto extends createZodDto(
  criterionReplacementDtoSchema,
) {}
