import { Module } from '@nestjs/common';

import { ValidationModule } from './validation/validation.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ConfigModule } from './config/config.module';
import { SuccessfulResponseBuilderModule } from './successful-response-builder/succesful-response-builder.module';

import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule,
    DrizzleModule,
    SuccessfulResponseBuilderModule,
    ValidationModule,
    IndicatorsModule,
    UsersModule
  ],
})
export class AppModule {}
