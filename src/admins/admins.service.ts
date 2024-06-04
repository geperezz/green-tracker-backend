import { Inject, Injectable } from '@nestjs/common';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { AdminCreationDto } from './dtos/admin-creation.dto';
import { AdminUniqueTraitDto } from './dtos/admin-unique-trait.dto';
import { AdminDto } from './dtos/admin.dto';
import { AdminsPageDto } from './dtos/admins-page.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { AdminReplacementDto } from './dtos/admin-replacement.dto';
import { UsersService } from 'src/users/users.service';
import { UserCreationDto } from 'src/users/dtos/user-creation.dto';
import { UserUniqueTraitDto } from 'src/users/dtos/user-unique-trait.dto';
import { UserFiltersDto } from 'src/users/dtos/user-filters.dto';
import { UserReplacementDto } from 'src/users/dtos/user-replacement.dto';

export abstract class AdminsServiceError extends Error {}
export class AdminNotFoundError extends AdminsServiceError {}

@Injectable()
export class AdminsService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly usersService: UsersService,
  ) {}

  async create(
    adminCreationDto: AdminCreationDto,
    transaction?: DrizzleTransaction,
  ): Promise<AdminDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const adminAsUser = await this.usersService.create(
          UserCreationDto.create({ ...adminCreationDto, role: 'admin' }),
          transaction,
        );

        return AdminDto.create(adminAsUser);
      },
    );
  }

  async findOne(
    adminUniqueTraitDto: AdminUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<AdminDto | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [adminAsUser = null] = await this.usersService.findAll(
          UserFiltersDto.create({
            id: adminUniqueTraitDto.id,
            role: 'admin',
          }),
          transaction,
        );
        if (!adminAsUser) {
          return null;
        }
        return AdminDto.create(adminAsUser);
      },
    );
  }

  async findPage(
    paginationOptionsDto: PaginationOptionsDto,
    transaction?: DrizzleTransaction,
  ): Promise<AdminsPageDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const adminsAsUsersPage = await this.usersService.findPage(
          paginationOptionsDto,
          UserFiltersDto.create({ role: 'admin' }),
          transaction,
        );

        const adminDtosPage = {
          ...adminsAsUsersPage,
          items: adminsAsUsersPage.items.map((adminAsUser) =>
            AdminDto.create(adminAsUser),
          ),
        };

        return adminDtosPage;
      },
    );
  }

  async replace(
    adminUniqueTraitDto: AdminUniqueTraitDto,
    adminReplacementDto: AdminReplacementDto,
    transaction?: DrizzleTransaction,
  ): Promise<AdminDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        if (!(await this.findOne(adminUniqueTraitDto))) {
          throw new AdminNotFoundError();
        }

        const newAdmin = await this.usersService.replace(
          UserUniqueTraitDto.create(adminUniqueTraitDto),
          UserReplacementDto.create({
            ...adminReplacementDto,
            role: 'admin',
          }),
          transaction,
        );
        return AdminDto.create(newAdmin);
      },
    );
  }

  async delete(
    adminUniqueTraitDto: AdminUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<AdminDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        if (!(await this.findOne(adminUniqueTraitDto))) {
          throw new AdminNotFoundError();
        }

        const admin = await this.usersService.delete(
          UserUniqueTraitDto.create(adminUniqueTraitDto),
          transaction,
        );
        return AdminDto.create(admin);
      },
    );
  }
}
