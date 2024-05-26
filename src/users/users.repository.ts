import { Inject, Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { usersTable } from './users.table'; 
import { PaginationOptions, paginationOptionsSchema } from 'src/pagination/schemas/pagination-options.schema';
import { UserCreationDto } from './dtos/user-creation.dto'; 
import { User, userSchema } from './schemas/user.schema'; 
import { UsersPage } from './schemas/users-page.schema'; 

export class UsersRepositoryError extends Error {}
export class UserNotFoundError extends UsersRepositoryError {}
export class InvalidUserIdError extends UsersRepositoryError {}
export class InvalidPaginationOptionsError extends UsersRepositoryError {}
export class InvalidCreationDataError extends UsersRepositoryError {}
export class InvalidReplacementDataError extends UsersRepositoryError {}

@Injectable()
export class UsersRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient, 
  ) {}

  async create(
    creationData: UserCreationDto,
    transaction?: DrizzleTransaction,
  ): Promise<User> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [createdUser] = await transaction
          .insert(usersTable)
          .values(creationData)
          .returning();

        return userSchema.parse(createdUser);
      },
    );
  }

  async findOne(
    userId: User['id'],
    transaction?: DrizzleTransaction,
  ): Promise<User | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [foundUser = null] = await transaction
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, userId));

        if (!foundUser) {
          return null;
        }
        return userSchema.parse(foundUser);
      },
    );
  }
  
  async findByRole(
    userRole: User['role'],
    transaction?: DrizzleTransaction,
  ): Promise<User | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [foundUser = null] = await transaction
          .select()
          .from(usersTable)
          .where(eq(usersTable.role, userRole));

        if (!foundUser) {
          return null;
        }
        return userSchema.parse(foundUser);
      },
    );
  }

  async findPage(
    paginationOptions: PaginationOptions,
    transaction?: DrizzleTransaction,
  ): Promise<UsersPage> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const usersPageQuery = transaction
          .select()
          .from(usersTable)
          .limit(paginationOptions.itemsPerPage)
          .offset(
            paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
          )
          .as('users_page');

        const nonValidatedUsersPage = await transaction
          .select()
          .from(usersPageQuery);
        const usersPage = nonValidatedUsersPage.map((user) =>
          userSchema.parse(user),
        );

        const [{ usersCount }] = await transaction
          .select({
            usersCount: count(usersPageQuery.id),
          })
          .from(usersPageQuery);

        return {
          items: usersPage,
          ...paginationOptions,
          pageCount: Math.ceil(usersCount / paginationOptions.itemsPerPage),
          itemCount: usersCount,
        };
      },
    );
  }

  async replace(
    userId: User['id'],
    replacementData: Partial<User>,
    transaction?: DrizzleTransaction,
  ): Promise<User> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [replacedUser = null] = await transaction
          .update(usersTable)
          .set(replacementData)
          .where(eq(usersTable.id, userId))
          .returning();
        if (!replacedUser) {
          throw new UserNotFoundError();
        }

        return userSchema.parse(replacedUser);
      },
    );
  }

  async delete(
    userId: User['id'],
    transaction?: DrizzleTransaction,
  ): Promise<User> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [deletedUser = null] = await transaction
          .delete(usersTable)
          .where(eq(usersTable.id, userId))
          .returning();
        if (!deletedUser) {
          throw new UserNotFoundError();
        }

        return userSchema.parse(deletedUser);
      },
    );
  }
}
