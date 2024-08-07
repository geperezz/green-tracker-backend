import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
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
  UserAlreadyExistsError as UserAlreadyExistsRepositoryError,
} from './users.repository';
import { UsersPageDto } from './dtos/users-page.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { UserReplacementDto } from './dtos/user-replacement.dto';
import { UserFiltersDto } from './dtos/user-filters.dto';
import { UserFilters } from './schemas/user-filters.schema';

export abstract class UsersServiceError extends Error {}
export class UserNotFoundError extends UsersServiceError {}
export class UserAlreadyExistsError extends UsersServiceError {}

@Injectable()
export class UsersService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(
    userCreationDto: UserCreationDto,
    transaction?: DrizzleTransaction,
  ): Promise<UserDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        try {
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
        } catch (error) {
          if (error instanceof UserAlreadyExistsRepositoryError) {
            throw new UserAlreadyExistsError(error.message, { cause: error });
          }
          throw error;
        }
      },
    );
  }

  async findOne(
    userUniqueTraitDto: UserUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<UserDto | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const user = await this.usersRepository.findOne(
          UserUniqueTrait.parse(userUniqueTraitDto),
          transaction,
        );
        if (!user) {
          return null;
        }
        return UserDto.create(user);
      },
    );
  }

  async findAll(
    filters?: UserFiltersDto,
    transaction?: DrizzleTransaction,
  ): Promise<UserDto[]> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const userSchemas = await this.usersRepository.findAll(
          filters ? UserFilters.parse(filters) : undefined,
          transaction,
        );

        return userSchemas.map((userSchema) => UserDto.create(userSchema));
      },
    );
  }

  async findPage(
    paginationOptionsDto: PaginationOptionsDto,
    filters?: UserFiltersDto,
    transaction?: DrizzleTransaction,
  ): Promise<UsersPageDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
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
      },
    );
  }

  async replace(
    userUniqueTraitDto: UserUniqueTraitDto,
    userReplacementDto: UserReplacementDto,
    transaction?: DrizzleTransaction,
  ): Promise<UserDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        try {
          const newUser = await this.usersRepository.replace(
            UserUniqueTrait.parse(userUniqueTraitDto),
            UserReplacement.parse({
              ...userReplacementDto,
              password: userReplacementDto.password
                ? await bcrypt.hash(
                    userReplacementDto.password,
                    await bcrypt.genSalt(10),
                  )
                : undefined,
            }),
            transaction,
          );
          return UserDto.create(newUser);
        } catch (error) {
          if (error instanceof UserNotFoundRepositoryError) {
            throw new UserNotFoundError();
          }
          if (error instanceof UserAlreadyExistsRepositoryError) {
            throw new UserAlreadyExistsError(error.message, { cause: error });
          }
          throw error;
        }
      },
    );
  }

  async delete(
    userUniqueTraitDto: UserUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<UserDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
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
      },
    );
  }
}
