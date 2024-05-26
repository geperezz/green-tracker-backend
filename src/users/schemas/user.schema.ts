import { z } from 'nestjs-zod/z';

export const userSchema = z.object({
  id: z.string().uuid(),
  password: z.string().min(6),
  role: z.enum(['unit', 'admin', 'superadmin']),
});

export type User = z.infer<typeof userSchema>;
