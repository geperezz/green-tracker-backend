import { createZodDto } from 'nestjs-zod';

import { indicatorDtoSchema } from './indicator.dto';
import { z } from 'nestjs-zod/z';

export class IndicatorIndexDto extends createZodDto(
  indicatorDtoSchema.pick({ index: true }),
) {
  index: z.infer<typeof indicatorDtoSchema>['index'] = super.index;
}
