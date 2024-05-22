import { createZodDto } from 'nestjs-zod';

import { indicatorDtoSchema } from './indicator.dto';

export const indicatorCreationDtoSchema = indicatorDtoSchema;

export class IndicatorCreationDto extends createZodDto(
  indicatorCreationDtoSchema,
) {}
