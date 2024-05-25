import { createZodDto } from 'nestjs-zod';
import { userDtoSchema } from './user.dto'; 
import { z } from 'nestjs-zod/z';

export class UserIndexDto extends createZodDto(
  userDtoSchema.pick({ id: true }), 
) {
  id: z.infer<typeof userDtoSchema>['id'] = super.id; 
}
