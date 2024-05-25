import {
  buildPageDtoClass,
  buildPageDtoSchema,
} from 'src/pagination/dtos/page.dto';
import { criterionDtoSchema } from './criterion.dto';

export const criteriaPageDtoSchema = buildPageDtoSchema(criterionDtoSchema);

export class CriteriaPageDto extends buildPageDtoClass(criterionDtoSchema) {}
