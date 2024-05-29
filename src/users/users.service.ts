import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { UserCreation } from './schemas/user-creation.schema';
import { UserUniqueTrait } from './schemas/user-unique-trait.schema';
import { UserReplacement } from './schemas/user-replacement.schema';
import { UserCreationDto } from './dtos/user-creation.dto';
import { UserUniqueTraitDto } from './dtos/user-unique-trait.dto';
import { UserDto } from './dtos/user.dto';
import {
  UsersRepository,
  UserNotFoundError as UserNotFoundRepositoryError,
} from './users.repository';
import { UsersPageDto } from './dtos/users-page.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { UserReplacementDto } from './dtos/user-replacement.dto';
import { UserFiltersDto } from './dtos/user-filters.dto';
import { UserFilters } from './schemas/user-filters.schema';

export abstract class UsersServiceError extends Error {}
export class UserNotFoundError extends UsersServiceError {}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(
    userCreationDto: UserCreationDto,
    transaction?: DrizzleTransaction,
  ): Promise<UserDto> {
    const user = await this.usersRepository.create(
      UserCreation.parse({
        ...userCreationDto,
        password: await bcrypt.hash(
          userCreationDto.password,
          await bcrypt.genSalt(10),
        ),
      }),
      transaction,
    );
    return UserDto.create(user);
  }

  async findOne(
    userUniqueTraitDto: UserUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<UserDto | null> {
    const user = await this.usersRepository.findOne(
      UserUniqueTrait.parse(userUniqueTraitDto),
      transaction,
    );
    if (!user) {
      return null;
    }
    return UserDto.create(user);
  }

  async findAll(
    filters?: UserFiltersDto,
    transaction?: DrizzleTransaction,
  ): Promise<UserDto[]> {
    const userSchemas = await this.usersRepository.findAll(
      filters ? UserFilters.parse(filters) : undefined,
      transaction,
    );

    return userSchemas.map((userSchema) => UserDto.create(userSchema));
  }

  async findPage(
    paginationOptionsDto: PaginationOptionsDto,
    filters?: UserFiltersDto,
    transaction?: DrizzleTransaction,
  ): Promise<UsersPageDto> {
    const userSchemasPage = await this.usersRepository.findPage(
      PaginationOptions.parse(paginationOptionsDto),
      filters ? UserFilters.parse(filters) : undefined,
      transaction,
    );

    const userDtosPage = {
      ...userSchemasPage,
      items: userSchemasPage.items.map((userSchema) =>
        UserDto.create(userSchema),
      ),
    };

    return userDtosPage;
  }

  async replace(
    userUniqueTraitDto: UserUniqueTraitDto,
    userReplacementDto: UserReplacementDto,
    transaction?: DrizzleTransaction,
  ): Promise<UserDto> {
    try {
      const newUser = await this.usersRepository.replace(
        UserUniqueTrait.parse(userUniqueTraitDto),
        UserReplacement.parse(userReplacementDto),
        transaction,
      );
      return UserDto.create(newUser);
    } catch (error) {
      if (error instanceof UserNotFoundRepositoryError) {
        throw new UserNotFoundError();
      }
      throw error;
    }
  }

  async delete(
    userUniqueTraitDto: UserUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<UserDto> {
    try {
      const user = await this.usersRepository.delete(
        UserUniqueTrait.parse(userUniqueTraitDto),
        transaction,
      );
      return UserDto.create(user);
    } catch (error) {
      if (error instanceof UserNotFoundRepositoryError) {
        throw new UserNotFoundError();
      }
      throw error;
    }
  }
}
