import {
  buildPageDtoClass,
  buildPageDtoSchema,
} from 'src/pagination/dtos/page.dto';
import { activityDtoSchema } from './activity.dto';

export const activitiesPageDtoSchema = buildPageDtoSchema(activityDtoSchema);

export class ActivitiesPageDto extends buildPageDtoClass(activityDtoSchema) {}
