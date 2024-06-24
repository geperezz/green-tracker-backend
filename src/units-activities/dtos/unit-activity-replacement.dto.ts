import { createZodDto } from 'nestjs-zod';

import { unitActivityCreationDtoSchema } from './unit-activity-creation.dto';

export const unitActivityReplacementDtoSchema = unitActivityCreationDtoSchema;

export class UnitActivityReplacementDto extends createZodDto(
  unitActivityReplacementDtoSchema,
) {}
