import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  clave: z.string(),
  rol: z.string(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
