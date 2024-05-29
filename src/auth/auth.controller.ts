import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService, InvalidCredentialsError } from './auth.service';
import { CredentialsDto } from './dtos/credentials.dto';
import { NoLoginRequired } from './no-login-required.decorator';
import { LoginResultDto, loginResultDtoSchema } from './dtos/login-result.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authenticationService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @NoLoginRequired()
  async login(
    @Body()
    loginInputDto: CredentialsDto,
  ): Promise<LoginResultDto> {
    try {
      const loginOutput = await this.authenticationService.login(loginInputDto);
      return loginResultDtoSchema.parse(loginOutput);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(
          'Invalid credentials',
          'Invalid ID or password',
        );
      }
      throw error;
    }
  }
}
