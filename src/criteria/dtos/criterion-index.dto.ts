import { createZodDto } from 'nestjs-zod';

import { criterionDtoSchema } from './criterion.dto';
import { z } from 'nestjs-zod/z';

export class CriterionIndexDto extends createZodDto(
  criterionDtoSchema.pick({ indicatorIndex: true, subindex: true }),
) {
  indicatorIndex: z.infer<typeof criterionDtoSchema>['indicatorIndex'] = super
    .indicatorIndex;
  subindex: z.infer<typeof criterionDtoSchema>['subindex'] = super.subindex;
}
