import { z } from 'zod';

export const UserSchema = z.object({
  rol: z.string(),
  clave: z.string(),
});

export type User = z.infer<typeof UserSchema>;
