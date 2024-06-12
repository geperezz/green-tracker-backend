import { createZodDto } from 'nestjs-zod';

import { unitCreationDtoSchema } from './unit-creation.dto';

export const unitReplacementDtoSchema = unitCreationDtoSchema.extend({
  password: unitCreationDtoSchema.shape.password.optional(),
});

export class UnitReplacementDto extends createZodDto(
  unitReplacementDtoSchema,
) {}
