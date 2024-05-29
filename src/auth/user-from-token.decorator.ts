import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { UserDto } from 'src/users/dtos/user.dto';

export const UserFromToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserDto => {
    const request: Record<string, any> = context.switchToHttp().getRequest();
    if (!('user' in request)) {
      throw new UnauthorizedException('Login required', '');
    }

    return UserDto.create(request.user);
  },
);
