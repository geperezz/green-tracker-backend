import {
  buildPageDtoClass,
  buildPageDtoSchema,
} from 'src/pagination/dtos/page.dto';
import { indicatorDtoSchema } from './indicator.dto';

export const indicatorsPageDtoSchema = buildPageDtoSchema(indicatorDtoSchema);

export class IndicatorsPageDto extends buildPageDtoClass(indicatorDtoSchema) {}
