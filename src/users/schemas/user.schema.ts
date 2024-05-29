import { z } from 'nestjs-zod/z';

import { userRole } from '../users.table';

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().trim().min(1),
  role: z.enum(userRole.enumValues),
});

export const User = userSchema.brand('User');
export type User = z.infer<typeof User>;
