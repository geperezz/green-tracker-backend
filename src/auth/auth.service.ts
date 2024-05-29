import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { CredentialsDto } from './dtos/credentials.dto';
import { LoginResultDto } from './dtos/login-result.dto';
import { UsersRepository } from 'src/users/users.repository';
import { UserUniqueTrait } from 'src/users/schemas/user-unique-trait.schema';
import { UserDto } from 'src/users/dtos/user.dto';
import { User } from 'src/users/schemas/user.schema';
import { UserFilters } from 'src/users/schemas/user-filters.schema';

export abstract class AuthServiceError extends Error {}
export class InvalidCredentialsError extends AuthServiceError {}

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async login(credentials: CredentialsDto): Promise<LoginResultDto> {
    let user!: User | null;
    if (credentials.id) {
      user = await this.usersRepository.findOne(
        UserUniqueTrait.parse({ id: credentials.id }),
      );
    } else if (credentials.email) {
      [user = null] = await this.usersRepository.findAll(
        UserFilters.parse({ email: credentials.email }),
      );
    }

    if (!user) {
      throw new InvalidCredentialsError();
    }
    if (!(await bcrypt.compare(credentials.password, user.password))) {
      throw new InvalidCredentialsError();
    }

    return LoginResultDto.create({
      token: await this.jwtService.signAsync({ id: user.id }),
      user: UserDto.create(user),
    });
  }
}
