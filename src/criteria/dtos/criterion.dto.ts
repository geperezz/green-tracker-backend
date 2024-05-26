import { createZodDto } from 'nestjs-zod';

import { Criterion, criterionSchema } from '../schemas/criterion.schema';

export const criterionDtoSchema = criterionSchema;

export class CriterionDto extends createZodDto(criterionDtoSchema) {
  static fromSchema(schema: Criterion): CriterionDto {
    return criterionDtoSchema.parse(schema);
  }
}
