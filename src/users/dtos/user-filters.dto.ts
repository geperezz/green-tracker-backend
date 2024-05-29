import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { userFiltersSchema } from '../schemas/user-filters.schema';

export const userFiltersDtoSchema = userFiltersSchema.omit({ password: true });

type InferredUserFiltersDto = z.infer<typeof userFiltersDtoSchema>;

export class UserFiltersDto extends createZodDto(userFiltersDtoSchema) {
  id?: InferredUserFiltersDto['id'] = super.id;
  name?: InferredUserFiltersDto['name'] = super.name;
  email?: InferredUserFiltersDto['email'] = super.email;
  role?: InferredUserFiltersDto['role'] = super.role;
}
