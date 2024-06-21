import { createZodDto } from 'nestjs-zod';

import { criterionSchema } from '../schemas/criterion.schema';

export const criterionDtoSchema = criterionSchema;

export class CriterionDto extends createZodDto(criterionDtoSchema) {}
