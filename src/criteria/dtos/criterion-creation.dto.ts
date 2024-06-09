import { createZodDto } from 'nestjs-zod';

import { criterionDtoSchema } from './criterion.dto';

export const criterionCreationDtoSchema = criterionDtoSchema.omit({
  categoryName: true,
});

export class CriterionCreationDto extends createZodDto(
  criterionCreationDtoSchema,
) {}
