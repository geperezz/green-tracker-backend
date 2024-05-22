import { Global, Module, OnModuleInit } from '@nestjs/common';

import { buildDrizzleClient } from './drizzle.client';
import { DrizzleMigrator } from './drizzle.migrator';
import { Config } from 'src/config/config.loader';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE_CLIENT',
      useFactory: (config: Config) =>
        buildDrizzleClient(config.POSTGRES_DATABASE_URL),
      inject: [{ token: 'CONFIG', optional: false }],
    },
    DrizzleMigrator,
  ],
  exports: ['DRIZZLE_CLIENT', DrizzleMigrator],
})
export class DrizzleModule implements OnModuleInit {
  constructor(private readonly drizzleMigrator: DrizzleMigrator) {}

  async onModuleInit(): Promise<void> {
    await this.drizzleMigrator.applyMigrations();
  }
}
