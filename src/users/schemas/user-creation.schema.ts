import { z } from 'nestjs-zod/z';

import { userSchema } from './user.schema';

export const userCreationSchema = userSchema.extend({
  id: userSchema.shape.id.optional(),
});

export const UserCreation = userCreationSchema.brand('UserCreation');
export type UserCreation = z.infer<typeof UserCreation>;
