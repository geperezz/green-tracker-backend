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

  //currently only one superadmin
  private async seedSuperadmins(
    transaction: DrizzleTransaction,
  ): Promise<void> {
    const [seed] = superadminSeeds;

    const seedAlreadyInDb = !!(await this.usersRepository.findByRole(
      seed.role,
      transaction,
    ));
    
    if (!seedAlreadyInDb) {
      await this.usersRepository.create(seed, transaction);
    }
  }
}
