import { createZodDto } from 'nestjs-zod';

import { indicatorCreationDtoSchema } from './indicator-creation.dto';

export const indicatorReplacementDtoSchema = indicatorCreationDtoSchema;

export class IndicatorReplacementDto extends createZodDto(
  indicatorReplacementDtoSchema,
) {}
