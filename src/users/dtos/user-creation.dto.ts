import { createZodDto } from 'nestjs-zod';
import { userDtoSchema } from './user.dto';
import { z } from 'nestjs-zod/z';

export const userCreationDtoSchema = userDtoSchema.extend({
  id: z.string().uuid().optional(),
});

export class UserCreationDto extends createZodDto(userCreationDtoSchema) {}
