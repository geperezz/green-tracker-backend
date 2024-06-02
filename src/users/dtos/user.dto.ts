import { createZodDto } from 'nestjs-zod';
import { userSchema } from '../schemas/user.schema';

export const userDtoSchema = userSchema.omit({ password: true });

export class UserDto extends createZodDto(userDtoSchema) {}
