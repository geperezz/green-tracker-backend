import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { AuthGuard } from './auth.guard';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Config } from 'src/config/config.loader';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: Config) => ({
        secret: config.AUTHENTICATION_TOKEN_SECRET,
        signOptions: {
          expiresIn: config.AUTHENTICATION_TOKEN_EXPIRES_IN,
        },
      }),
      inject: [{ token: 'CONFIG', optional: false }],
    }),
    UsersModule,
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
