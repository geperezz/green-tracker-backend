import {
  buildPageDtoClass,
  buildPageDtoSchema,
} from 'src/pagination/dtos/page.dto';
import { userDtoSchema } from './user.dto';

export const usersPageDtoSchema = buildPageDtoSchema(userDtoSchema);

export class UsersPageDto extends buildPageDtoClass(userDtoSchema) {}
