import { Module } from '@nestjs/common';

import { ValidationModule } from './validation/validation.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ConfigModule } from './config/config.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { SuccessfulResponseBuilderModule } from './successful-response-builder/succesful-response-builder.module';
import { CriteriaModule } from './criteria/criteria.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ActivitiesModule } from './activities/activities.module';
import { AdminsModule } from './admins/admins.module';
import { EvidenceModule } from './evidence/evidence.module';
import { UnitsModule } from './units/units.module';
import { RecommendedCategoriesModule } from './recommended-categories/recommended-categories.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadPeriodModule } from './upload-period/upload-period.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    DrizzleModule,
    SuccessfulResponseBuilderModule,
    ValidationModule,
    AuthModule,
    UsersModule,
    AdminsModule,
    UnitsModule,
    IndicatorsModule,
    CriteriaModule,
    CategoriesModule,
    ActivitiesModule,
    ActivitiesModule,
    EvidenceModule,
    UploadPeriodModule,
    RecommendedCategoriesModule,
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: process.env.EMAIL_HOST,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        },
        template: {
          dir: join(__dirname, '/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
})
export class AppModule {}
