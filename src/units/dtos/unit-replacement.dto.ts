import { createZodDto } from 'nestjs-zod';

import { unitCreationDtoSchema } from './unit-creation.dto';

export const unitReplacementDtoSchema = unitCreationDtoSchema;

export class UnitReplacementDto extends createZodDto(
  unitReplacementDtoSchema,
) {}
