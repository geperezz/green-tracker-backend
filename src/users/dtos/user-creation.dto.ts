import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { userDtoSchema } from './user.dto';

export const userCreationDtoSchema = userDtoSchema.extend({
  id: userDtoSchema.shape.id.optional(),
  password: z.string().trim().min(1),
});

export class UserCreationDto extends createZodDto(userCreationDtoSchema) {}
