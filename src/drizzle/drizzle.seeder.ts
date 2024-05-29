import { Inject } from '@nestjs/common';
import { DrizzleClient, DrizzleTransaction } from './drizzle.client';
import { Config } from 'src/config/config.loader';
import { UsersService } from 'src/users/users.service';
import { UserCreationDto } from 'src/users/dtos/user-creation.dto';
import { UserFiltersDto } from 'src/users/dtos/user-filters.dto';

export class DrizzleSeeder {
  constructor(
    @Inject('CONFIG')
    private readonly config: Config,
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly usersService: UsersService,
  ) {}

  async seed(transaction?: DrizzleTransaction): Promise<void> {
    await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        await this.seedSuperadmins(transaction);
      },
    );
  }

  private async seedSuperadmins(
    transaction: DrizzleTransaction,
  ): Promise<void> {
    const superAdminToCreate = {
      id: this.config.SUPERADMIN_ID,
      name: this.config.SUPERADMIN_NAME,
      email: this.config.SUPERADMIN_EMAIL,
      password: this.config.SUPERADMIN_PASSWORD,
      role: 'superadmin',
    } as const;

    const seedAlreadyInDb = !!(
      await this.usersService.findAll(
        UserFiltersDto.create({ email: superAdminToCreate.email }),
        transaction,
      )
    ).length;

    if (!seedAlreadyInDb) {
      await this.usersService.create(
        UserCreationDto.create(superAdminToCreate),
        transaction,
      );
    }
  }
}
