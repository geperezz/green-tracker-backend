import {
  buildPageDtoClass,
  buildPageDtoSchema,
} from 'src/pagination/dtos/page.dto';
import { categoryDtoSchema } from './category.dto';

export const categoriesPageDtoSchema = buildPageDtoSchema(categoryDtoSchema);

export class CategoriesPageDto extends buildPageDtoClass(categoryDtoSchema) {}
