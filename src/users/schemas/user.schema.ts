import { z } from 'nestjs-zod/z';

export const userSchema = z.object({
  id: z.number(), 
  contrasena: z.string().min(6), 
  rol: z.string(), 
});

export type User = z.infer<typeof userSchema>;
