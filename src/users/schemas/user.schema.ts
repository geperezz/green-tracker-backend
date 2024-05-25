import { z } from 'nestjs-zod/z';

export const userSchema = z.object({
  id: z.number(), // Suponiendo que el id es un número
  contrasena: z.string().min(6), // Suponiendo que la contraseña debe tener al menos 6 caracteres
  rol: z.string(), // Suponiendo que el rol es una cadena
});

export type User = z.infer<typeof userSchema>;
