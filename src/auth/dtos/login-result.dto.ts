import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { userDtoSchema } from 'src/users/dtos/user.dto';

export const loginResultDtoSchema = z.object({
  token: z.string().trim().min(1),
  user: userDtoSchema,
});

export class LoginResultDto extends createZodDto(loginResultDtoSchema) {}
