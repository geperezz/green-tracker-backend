import { createZodDto } from 'nestjs-zod';

import { userDtoSchema } from 'src/users/dtos/user.dto';

export const adminDtoSchema = userDtoSchema.omit({ role: true });

export class AdminDto extends createZodDto(adminDtoSchema) {}
