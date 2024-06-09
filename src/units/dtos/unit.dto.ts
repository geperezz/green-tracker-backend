import { createZodDto } from 'nestjs-zod';

import { userDtoSchema } from 'src/users/dtos/user.dto';

export const UnitDtoSchema = userDtoSchema.omit({ role: true });

export class UnitDto extends createZodDto(UnitDtoSchema) {}
