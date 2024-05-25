import { z } from 'zod';

export const CreateUserSchema = z.object({
    rol: z.string(),
  clave: z.string(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
