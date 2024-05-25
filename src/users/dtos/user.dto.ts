import { createZodDto } from 'nestjs-zod';
import { User, userSchema } from '../schemas/user.schema'; 

export const userDtoSchema = userSchema; 

export class UserDto extends createZodDto(userDtoSchema) {
  static fromSchema(schema: User): UserDto {
    return userDtoSchema.parse(schema);
  }
}
