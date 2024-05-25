import { createZodDto } from 'nestjs-zod';
import { User, userSchema } from '../schemas/user.schema'; // Ajusta la referencia al esquema de usuario

export const userDtoSchema = userSchema; // Ajusta la referencia al esquema de usuario

export class UserDto extends createZodDto(userDtoSchema) {
  static fromSchema(schema: User): UserDto {
    return userDtoSchema.parse(schema);
  }
}
