import { z } from 'nestjs-zod/z';

import { userSchema } from './user.schema';

export const userUniqueTraitSchema = userSchema.pick({ id: true });

export const UserUniqueTrait = userUniqueTraitSchema.brand('UserUniqueTrait');
export type UserUniqueTrait = z.infer<typeof UserUniqueTrait>;
