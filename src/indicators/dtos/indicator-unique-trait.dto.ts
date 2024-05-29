import { createZodDto } from 'nestjs-zod';

import { indicatorDtoSchema } from './indicator.dto';
import { z } from 'nestjs-zod/z';

export const indicatorUniqueTraitDtoSchema = indicatorDtoSchema.pick({
  index: true,
});

type InferredIndicatorUniqueTraitDto = z.infer<
  typeof indicatorUniqueTraitDtoSchema
>;

export class IndicatorUniqueTraitDto extends createZodDto(
  indicatorUniqueTraitDtoSchema,
) {
  index: InferredIndicatorUniqueTraitDto['index'] = super.index;
}
