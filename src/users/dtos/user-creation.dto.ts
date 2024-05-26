import { createZodDto } from 'nestjs-zod';
import { userDtoSchema } from './user.dto';

export const userCreationDtoSchema = userDtoSchema.extend({
  id: userDtoSchema.shape.id.optional()
});

export class UserCreationDto extends createZodDto(userCreationDtoSchema) {}
