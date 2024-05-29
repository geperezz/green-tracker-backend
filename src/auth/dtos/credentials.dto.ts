import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { userDtoSchema } from 'src/users/dtos/user.dto';
import { userCreationDtoSchema } from 'src/users/dtos/user-creation.dto';

export const credentialsDtoSchema = z
  .object({
    id: userDtoSchema.shape.id.optional(),
    email: userDtoSchema.shape.email.optional(),
    password: userCreationDtoSchema.shape.password,
  })
  .refine((credentials) => !!credentials.id !== !!credentials.email, {
    message: 'One and only one of id and email must be specified',
  });

export class CredentialsDto extends createZodDto(credentialsDtoSchema) {}
