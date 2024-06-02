import { Module } from '@nestjs/common';

import { ValidationModule } from './validation/validation.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ConfigModule } from './config/config.module';
import { SuccessfulResponseBuilderModule } from './successful-response-builder/succesful-response-builder.module';
import { CriteriaModule } from './criteria/criteria.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './admins/admins.module';

@Module({
  imports: [
    ConfigModule,
    DrizzleModule,
    SuccessfulResponseBuilderModule,
    ValidationModule,
    AuthModule,
    UsersModule,
    AdminsModule,
    IndicatorsModule,
    CriteriaModule,
  ],
})
export class AppModule {}
