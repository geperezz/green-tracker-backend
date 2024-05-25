import { createZodDto } from 'nestjs-zod';
import { userDtoSchema } from './user.dto'; 

export const userCreationDtoSchema = userDtoSchema; 

export class UserCreationDto extends createZodDto(
  userCreationDtoSchema,
) {} 
