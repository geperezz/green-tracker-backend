import { z } from 'nestjs-zod/z';
import { buildPageSchema } from 'src/pagination/schemas/page.schema';
import { User } from './user.schema';

export const usersPageSchema = buildPageSchema(User);

export const UsersPage = usersPageSchema.brand('UsersPage');
export type UsersPage = z.infer<typeof UsersPage>;
