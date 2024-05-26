import { createZodDto } from 'nestjs-zod';

import { indicatorDtoSchema } from './indicator.dto';
import { z } from 'nestjs-zod/z';

export const indicatorUniqueTraitDtoSchema = indicatorDtoSchema.pick({
  index: true,
});

export class IndicatorUniqueTraitDto extends createZodDto(
  indicatorUniqueTraitDtoSchema,
) {
  index: z.infer<typeof indicatorDtoSchema>['index'] = super.index;
}
