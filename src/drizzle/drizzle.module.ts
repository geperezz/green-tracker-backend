import { Global, Module, OnModuleInit, forwardRef } from '@nestjs/common';

import { buildDrizzleClient } from './drizzle.client';
import { DrizzleMigrator } from './drizzle.migrator';
import { Config } from 'src/config/config.loader';
import { DrizzleSeeder } from './drizzle.seeder';
import { UsersModule } from 'src/users/users.module';

@Global()
@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [
    {
      provide: 'DRIZZLE_CLIENT',
      useFactory: (config: Config) =>
        buildDrizzleClient(config.POSTGRES_DATABASE_URL),
      inject: [{ token: 'CONFIG', optional: false }],
    },
    DrizzleMigrator,
    DrizzleSeeder,
  ],
  exports: ['DRIZZLE_CLIENT', DrizzleMigrator],
})
export class DrizzleModule implements OnModuleInit {
  constructor(
    private readonly drizzleMigrator: DrizzleMigrator,
    private readonly drizzleSeeder: DrizzleSeeder,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.drizzleMigrator.applyMigrations();
    await this.drizzleSeeder.seed();
  }
}
