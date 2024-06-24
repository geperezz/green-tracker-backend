import { createZodDto } from 'nestjs-zod';

import { unitActivityDtoSchema } from './unit-activity.dto';

export const unitActivityCreationDtoSchema = unitActivityDtoSchema
  .omit({ evidence: true })
  .extend({
    id: unitActivityDtoSchema.shape.id.optional(),
  });

export class UnitActivityCreationDto extends createZodDto(
  unitActivityCreationDtoSchema,
) {}
