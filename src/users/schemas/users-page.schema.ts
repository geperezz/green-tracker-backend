import { z } from 'nestjs-zod/z';
import { buildPageSchema } from 'src/pagination/schemas/page.schema';
import { userSchema } from './user.schema'; 

export const usersPageSchema = buildPageSchema(userSchema); 

export type UsersPage = z.infer<typeof usersPageSchema>; 
