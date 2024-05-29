import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UserDto } from './dtos/user.dto';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import { UserFromToken } from 'src/auth/user-from-token.decorator';

@Controller('/users/')
@ApiTags('Users')
@LoggedInAs('any')
export class UsersController {
  @Get('/me/')
  findMe(
    @UserFromToken()
    user: UserDto,
  ): UserDto {
    return user;
  }
}
