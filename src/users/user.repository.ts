import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { dbConnPool } from '../drizzle/drizzle.client';
import { UserSchema, User } from './schemas/user.schema';

@Injectable()
export class UserRepository {
  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = UserSchema.parse(createUserDto);
    return await dbConnPool.users.insert(newUser);
  }

  async findOneById(id: number): Promise<User> {
    const user = await dbConnPool.users.findOne({ id });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return await dbConnPool.users.findMany();
  }

  async update(id: number, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    const updatedUser = UserSchema.parse(updateUserDto);
    await dbConnPool.users.update({ id }, updatedUser);
    return await this.findOneById(id);
  }

  async delete(id: number): Promise<void> {
    await dbConnPool.users.delete({ id });
  }
}
