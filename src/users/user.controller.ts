import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserSchema } from './dtos/create-user.dto';
import { z } from 'zod';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() body: unknown) {
    const createUserDto = CreateUserSchema.parse(body);
    return this.userService.createUser(createUserDto);
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(parseInt(id, 10));
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() body: unknown) {
    const updateUserDto = CreateUserSchema.partial().parse(body);
    return this.userService.updateUser(parseInt(id, 10), updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(parseInt(id, 10));
  }
}
