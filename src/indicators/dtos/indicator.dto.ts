import { createZodDto } from 'nestjs-zod';

import { Indicator, indicatorSchema } from '../schemas/indicator.schema';

export const indicatorDtoSchema = indicatorSchema;

export class IndicatorDto extends createZodDto(indicatorDtoSchema) {
  static fromSchema(schema: Indicator): IndicatorDto {
    return indicatorDtoSchema.parse(schema);
  }
}
