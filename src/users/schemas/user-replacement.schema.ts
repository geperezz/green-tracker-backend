import { z } from 'nestjs-zod/z';

import { userCreationSchema } from './user-creation.schema';

export const userReplacementSchema = userCreationSchema.extend({
  password: userCreationSchema.shape.password.optional(),
});

export const UserReplacement = userReplacementSchema.brand('UserReplacement');
export type UserReplacement = z.infer<typeof UserReplacement>;
