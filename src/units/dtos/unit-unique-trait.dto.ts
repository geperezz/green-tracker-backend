import { createZodDto } from 'nestjs-zod';

import { UnitDtoSchema } from './unit.dto';
import { z } from 'nestjs-zod/z';

export const unitUniqueTraitDtoSchema = UnitDtoSchema.pick({
  id: true,
});

type InferredUnitUniqueTraitDto = z.infer<typeof unitUniqueTraitDtoSchema>;

export class UnitUniqueTraitDto extends createZodDto(unitUniqueTraitDtoSchema) {
  id: InferredUnitUniqueTraitDto['id'] = super.id;
}
