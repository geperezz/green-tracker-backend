import { z } from 'nestjs-zod/z';
import { userSchema } from './user.schema';

export const userFiltersSchema = userSchema.partial();

export const UserFilters = userFiltersSchema.brand('UserFilters');
export type UserFilters = z.infer<typeof UserFilters>;
