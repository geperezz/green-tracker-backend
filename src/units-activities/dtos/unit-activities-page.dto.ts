import {
  buildPageDtoClass,
  buildPageDtoSchema,
} from 'src/pagination/dtos/page.dto';
import { unitActivityDtoSchema } from './unit-activity.dto';

export const unitActivitiesPageDtoSchema = buildPageDtoSchema(
  unitActivityDtoSchema,
);

export class UnitActivitiesPageDto extends buildPageDtoClass(
  unitActivityDtoSchema,
) {}
