import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { userDtoSchema } from './user.dto';

export class UserUniqueTraitDto extends createZodDto(
  userDtoSchema.pick({ id: true }),
) {
  id: z.infer<typeof userDtoSchema>['id'] = super.id;
}
