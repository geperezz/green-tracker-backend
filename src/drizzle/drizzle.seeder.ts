import { Inject } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { DrizzleClient, DrizzleTransaction } from './drizzle.client';
import { superadminSeeds } from './seeds/superadmin.seeds';

export class DrizzleSeeder {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly usersRepository: UsersRepository,
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
    await Promise.all(
      superadminSeeds.map(async (seed) => {
        if (!seed.id) return null;

        const seedAlreadyInDb = !!(await this.usersRepository.findOne(
          seed.id,
          transaction,
        ));

        if (!seedAlreadyInDb) {
          await this.usersRepository.create(seed, transaction);
        }
      }),
    );
  }
}
