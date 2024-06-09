import { createZodDto } from 'nestjs-zod';

import { userCreationDtoSchema } from 'src/users/dtos/user-creation.dto';

export const unitCreationDtoSchema = userCreationDtoSchema.omit({
  role: true,
});

export class UnitCreationDto extends createZodDto(unitCreationDtoSchema) {}
