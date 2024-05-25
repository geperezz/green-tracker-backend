import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserSchema, User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser: User = {
      rol: createUserDto.rol,
      clave: createUserDto.clave,
    };
    return this.userRepository.create(newUser);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: number): Promise<User> {
    return this.userRepository.findOneById(id);
  }

  async updateUser(id: number, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    const updatedUser = UserSchema.parse(updateUserDto);
    return this.userRepository.update(id, updatedUser);
  }

  async deleteUser(id: number): Promise<void> {
    return this.userRepository.delete(id);
  }
}
