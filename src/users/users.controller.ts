import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UserNotFoundError, UsersRepository } from './users.repository'; 
import { UserCreationDto } from './dtos/user-creation.dto'; 
import { UserDto } from './dtos/user.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { UsersPageDto } from './dtos/users-page.dto';
import { UserReplacementDto } from './dtos/user-replacement.dto';
import { UserIndexDto } from './dtos/user-index.dto';

@Controller('/users/') 
@ApiTags('Users') 
export class UsersController {
  constructor(private readonly userRepository: UsersRepository) {}

  @Post()
  async create(
    @Body() creationDataDto: UserCreationDto, 
  ): Promise<UserDto> {
    const createdUserSchema = await this.userRepository.create(creationDataDto); 
    return UserDto.fromSchema(createdUserSchema);
  }

  @Get('/:id/')
  async findOne(
    @Param() userIndexDto: UserIndexDto, 
  ): Promise<UserDto> {
    const userSchema = await this.userRepository.findOne(userIndexDto.id); 

    if (!userSchema) {
      throw new NotFoundException(
        'User not found',
        `There is no user with ID ${userIndexDto.id}`,
      );
    }

    return UserDto.fromSchema(userSchema);
  }

  @Get()
  async findPage(
    @Query() paginationOptionsDto: PaginationOptionsDto, 
  ): Promise<UsersPageDto> {
    const userSchemasPage = await this.userRepository.findPage(
      PaginationOptionsDto.toSchema(paginationOptionsDto),
    );

    const userDtosPage = {
      ...userSchemasPage,
      items: userSchemasPage.items.map((userSchema) =>
        UserDto.fromSchema(userSchema),
      ),
    };

    return userDtosPage;
  }

  @Put('/:id/')
  async replace(
    @Param() userIndexDto: UserIndexDto, 
    @Body() replacementDataDto: UserReplacementDto, 
  ): Promise<UserDto> {
    try {
      const newUserSchema = await this.userRepository.replace(
        userIndexDto.id,
        replacementDataDto,
      );

      return UserDto.fromSchema(newUserSchema);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException('User not found', {
          description: `There is no user with ID ${userIndexDto.id}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete('/:id/')
  async delete(
    @Param() userIndexDto: UserIndexDto, 
  ): Promise<UserDto> {
    try {
      const deletedUserSchema = await this.userRepository.delete(
        userIndexDto.id,
      );

      return UserDto.fromSchema(deletedUserSchema);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException('User not found', {
          description: `There is no user with ID ${userIndexDto.id}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
