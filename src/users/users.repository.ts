import { Inject, Injectable } from '@nestjs/common';
import { SQL, and, count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { usersTable } from './users.table';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { User } from './schemas/user.schema';
import { UsersPage } from './schemas/users-page.schema';
import { UserCreation } from './schemas/user-creation.schema';
import { UserUniqueTrait } from './schemas/user-unique-trait.schema';
import { UserReplacement } from './schemas/user-replacement.schema';
import { UserFilters } from './schemas/user-filters.schema';

export abstract class UsersRepositoryError extends Error {}
export class UserNotFoundError extends UsersRepositoryError {}
export class UserAlreadyExistsError extends UsersRepositoryError {}

@Injectable()
export class UsersRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async create(
    creationData: UserCreation,
    transaction?: DrizzleTransaction,
  ): Promise<User> {
    try {
      return await (transaction ?? this.drizzleClient).transaction(
        async (transaction) => {
          const [createdUser] = await transaction
            .insert(usersTable)
            .values(creationData)
            .returning();

          return User.parse(createdUser);
        },
      );
    } catch (error) {
      if (error.code == '23505') {
        if (error.detail.includes('email')) {
          throw new UserAlreadyExistsError(
            `Ya existe un usuario con email '${creationData.email}'`,
            { cause: error },
          );
        }
        if (error.detail.includes('id')) {
          throw new UserAlreadyExistsError(
            `Ya existe un usuario con id '${creationData.id}'`,
            { cause: error },
          );
        }
      }
      throw error;
    }
  }

  async findOne(
    userUniqueTrait: UserUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<User | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [foundUser = null] = await transaction
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, userUniqueTrait.id));

        if (!foundUser) {
          return null;
        }
        return User.parse(foundUser);
      },
    );
  }

  async findAll(
    filters?: UserFilters,
    transaction?: DrizzleTransaction,
  ): Promise<User[]> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const nonValidatedUsers = await transaction
          .select()
          .from(usersTable)
          .where(this.transformFiltersToWhereConditions(filters));

        return nonValidatedUsers.map((user) => User.parse(user));
      },
    );
  }

  async findPage(
    paginationOptions: PaginationOptions,
    filters?: UserFilters,
    transaction?: DrizzleTransaction,
  ): Promise<UsersPage> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const filteredUsersQuery = transaction
          .select()
          .from(usersTable)
          .where(this.transformFiltersToWhereConditions(filters))
          .as('filtered_users');

        const nonValidatedUsersPage = await transaction
          .select()
          .from(filteredUsersQuery)
          .limit(paginationOptions.itemsPerPage)
          .offset(
            paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
          );
        const usersPage = nonValidatedUsersPage.map((user) => User.parse(user));

        const [{ usersCount }] = await transaction
          .select({
            usersCount: count(filteredUsersQuery.id),
          })
          .from(filteredUsersQuery);

        return UsersPage.parse({
          items: usersPage,
          ...paginationOptions,
          pageCount: Math.ceil(usersCount / paginationOptions.itemsPerPage),
          itemCount: usersCount,
        });
      },
    );
  }

  private transformFiltersToWhereConditions(filters?: UserFilters) {
    return and(
      filters?.id !== undefined ? eq(usersTable.id, filters.id) : undefined,
      filters?.name !== undefined
        ? eq(usersTable.name, filters.name)
        : undefined,
      filters?.email !== undefined
        ? eq(usersTable.email, filters.email)
        : undefined,
      filters?.password !== undefined
        ? eq(usersTable.password, filters.password)
        : undefined,
      filters?.role !== undefined
        ? eq(usersTable.role, filters.role)
        : undefined,
    );
  }

  async replace(
    userUniqueTrait: UserUniqueTrait,
    replacementData: UserReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<User> {
    try {
      return await (transaction ?? this.drizzleClient).transaction(
        async (transaction) => {
          const [replacedUser = null] = await transaction
            .update(usersTable)
            .set(replacementData)
            .where(eq(usersTable.id, userUniqueTrait.id))
            .returning();
          if (!replacedUser) {
            throw new UserNotFoundError();
          }

          return User.parse(replacedUser);
        },
      );
    } catch (error) {
      if (error.code == '23505') {
        if (error.detail.includes('email')) {
          throw new UserAlreadyExistsError(
            `Ya existe un usuario con email '${replacementData.email}'`,
            { cause: error },
          );
        }
        if (error.detail.includes('id')) {
          throw new UserAlreadyExistsError(
            `Ya existe un usuario con id '${replacementData.id}'`,
            { cause: error },
          );
        }
      }
      throw error;
    }
  }

  async delete(
    userUniqueTrait: UserUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<User> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [deletedUser = null] = await transaction
          .delete(usersTable)
          .where(eq(usersTable.id, userUniqueTrait.id))
          .returning();
        if (!deletedUser) {
          throw new UserNotFoundError();
        }

        return User.parse(deletedUser);
      },
    );
  }
}
