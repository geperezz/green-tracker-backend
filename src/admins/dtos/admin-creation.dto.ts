import { createZodDto } from 'nestjs-zod';

import { userCreationDtoSchema } from 'src/users/dtos/user-creation.dto';

export const adminCreationDtoSchema = userCreationDtoSchema.omit({
  role: true,
});

export class AdminCreationDto extends createZodDto(adminCreationDtoSchema) {}
