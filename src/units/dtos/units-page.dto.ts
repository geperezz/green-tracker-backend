import {
  buildPageDtoClass,
  buildPageDtoSchema,
} from 'src/pagination/dtos/page.dto';
import { unitDtoSchema } from './unit.dto';

export const unitsPageDtoSchema = buildPageDtoSchema(unitDtoSchema);

export class UnitsPageDto extends buildPageDtoClass(unitDtoSchema) {}
