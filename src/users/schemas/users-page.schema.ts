import { z } from 'nestjs-zod/z';
import { buildPageSchema } from 'src/pagination/schemas/page.schema';
import { userSchema } from './user.schema'; // Suponiendo que tienes un schema para usuarios

export const usersPageSchema = buildPageSchema(userSchema); // Cambiado a usersPageSchema y userSchema

export type UsersPage = z.infer<typeof usersPageSchema>; // Cambiado a UsersPage
