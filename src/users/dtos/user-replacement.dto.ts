import { createZodDto } from 'nestjs-zod';

import { userCreationDtoSchema } from './user-creation.dto';

export const userReplacementDtoSchema = userCreationDtoSchema.extend({
  password: userCreationDtoSchema.shape.password.optional(),
});

export class UserReplacementDto extends createZodDto(
  userReplacementDtoSchema,
) {}
