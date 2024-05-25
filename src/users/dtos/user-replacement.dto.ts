import { createZodDto } from 'nestjs-zod';
import { userCreationDtoSchema } from './user-creation.dto'; 

export const userReplacementDtoSchema = userCreationDtoSchema; 

export class UserReplacementDto extends createZodDto(
  userReplacementDtoSchema,
) {}
