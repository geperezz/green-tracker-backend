import {
  buildPageDtoClass,
  buildPageDtoSchema,
} from 'src/pagination/dtos/page.dto';
import { UnitDtoSchema } from './unit.dto';

export const unitsPageDtoSchema = buildPageDtoSchema(UnitDtoSchema);

export class UnitsPageDto extends buildPageDtoClass(UnitDtoSchema) {}
