import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { z } from 'nestjs-zod/z';

import { userDtoSchema } from 'src/users/dtos/user.dto';
import { UserUniqueTrait } from 'src/users/schemas/user-unique-trait.schema';
import { User } from 'src/users/schemas/user.schema';
import { UsersRepository } from 'src/users/users.repository';

const tokenPayloadSchema = z.object({
  id: userDtoSchema.shape.id,
});

const TokenPayload = tokenPayloadSchema.brand('TokenPayload');
type TokenPayload = z.infer<typeof TokenPayload>;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const noAuthRequired = this.reflector.getAllAndOverride<boolean>(
      'noAuthRequired',
      [context.getHandler(), context.getClass()],
    );

    if (noAuthRequired) {
      return true;
    }
    return (
      (await this.isAuthenticated(context)) &&
      (await this.isAuthorized(context))
    );
  }

  private async isAuthenticated(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    let tokenPayload!: unknown;
    try {
      tokenPayload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid authentication token', '');
    }

    (request as any).user = await this.extractUserFromPayload(tokenPayload);

    return true;
  }

  private extractTokenFromHeader(request: Request): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (!token) {
      throw new UnauthorizedException('Authentication token not found', '');
    }
    if (type !== 'Bearer') {
      throw new UnauthorizedException(
        'Invalid authentication token',
        'Token type is not Bearer',
      );
    }
    return token;
  }

  private async extractUserFromPayload(tokenPayload: unknown): Promise<User> {
    let parsedTokenPayload!: TokenPayload;
    try {
      parsedTokenPayload = TokenPayload.parse(tokenPayload);
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid authentication token',
        'Token payload is malformed',
      );
    }

    const user = await this.usersRepository.findOne(
      UserUniqueTrait.parse(parsedTokenPayload),
    );
    if (!user) {
      throw new UnauthorizedException(
        'Invalid authentication token',
        'Invalid credentials',
      );
    }

    return user;
  }

  private async isAuthorized(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = (request as any).user;

    const allowedRoles = this.reflector.getAllAndMerge<
      [User['role'], ...User['role'][]] | ['any']
    >('allowedRoles', [context.getHandler(), context.getClass()]);

    const hasAnyOfTheAllowedRoles =
      allowedRoles.some((allowedRole) => allowedRole === 'any') ||
      allowedRoles.some((allowedRole) => user.role === allowedRole);

    if (!hasAnyOfTheAllowedRoles) {
      throw new ForbiddenException(
        'The user does not have any of the required roles',
        `The user must have one of the following roles to access this resource: ${allowedRoles.join(', ')}`,
      );
    }
    return true;
  }
}
