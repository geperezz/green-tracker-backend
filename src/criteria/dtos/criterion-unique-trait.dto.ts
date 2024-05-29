import { createZodDto } from 'nestjs-zod';

import { criterionDtoSchema } from './criterion.dto';
import { z } from 'nestjs-zod/z';

export const criterionUniqueTraitDtoSchema = criterionDtoSchema.pick({
  indicatorIndex: true,
  subindex: true,
});

type InferredCriterionUniqueTraitDto = z.infer<typeof criterionDtoSchema>;

export class CriterionUniqueTraitDto extends createZodDto(
  criterionUniqueTraitDtoSchema,
) {
  indicatorIndex: InferredCriterionUniqueTraitDto['indicatorIndex'] = super
    .indicatorIndex;
  subindex: InferredCriterionUniqueTraitDto['subindex'] = super.subindex;
}
