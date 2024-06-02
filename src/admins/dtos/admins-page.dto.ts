import {
  buildPageDtoClass,
  buildPageDtoSchema,
} from 'src/pagination/dtos/page.dto';
import { adminDtoSchema } from './admin.dto';

export const adminsPageDtoSchema = buildPageDtoSchema(adminDtoSchema);

export class AdminsPageDto extends buildPageDtoClass(adminDtoSchema) {}
