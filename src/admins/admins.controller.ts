import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import { AdminNotFoundError, AdminsService } from './admins.service';
import { AdminCreationDto } from './dtos/admin-creation.dto';
import { AdminDto } from './dtos/admin.dto';
import { AdminUniqueTraitDto } from './dtos/admin-unique-trait.dto';
import { AdminsPageDto } from './dtos/admins-page.dto';
import { AdminReplacementDto } from './dtos/admin-replacement.dto';
import { UserFromToken } from 'src/auth/user-from-token.decorator';
import { UserDto } from 'src/users/dtos/user.dto';

@Controller('/admins/')
@ApiTags('Admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @LoggedInAs('superadmin')
  async create(
    @Body()
    creationDataDto: AdminCreationDto,
  ): Promise<AdminDto> {
    return await this.adminsService.create(creationDataDto);
  }

  @Get('/me/')
  @LoggedInAs('admin')
  async findMe(
    @UserFromToken()
    me: UserDto,
  ): Promise<AdminDto> {
    const admin = await this.adminsService.findOne(
      AdminUniqueTraitDto.create({ id: me.id }),
    );

    if (!admin) {
      throw new NotFoundException(
        'Admin not found',
        `There is no admin with id ${me.id}`,
      );
    }

    return admin;
  }

  @Get('/:id/')
  @LoggedInAs('superadmin')
  async findOne(
    @Param()
    adminUniqueTraitDto: AdminUniqueTraitDto,
  ): Promise<AdminDto> {
    const admin = await this.adminsService.findOne(adminUniqueTraitDto);

    if (!admin) {
      throw new NotFoundException(
        'Admin not found',
        `There is no admin with id ${adminUniqueTraitDto.id}`,
      );
    }

    return admin;
  }

  @Get()
  @LoggedInAs('superadmin')
  async findPage(
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<AdminsPageDto> {
    return await this.adminsService.findPage(paginationOptionsDto);
  }

  @Put('/:id/')
  @LoggedInAs('superadmin')
  async replace(
    @Param()
    adminUniqueTraitDto: AdminUniqueTraitDto,
    @Body()
    replacementDataDto: AdminReplacementDto,
  ): Promise<AdminDto> {
    try {
      return await this.adminsService.replace(
        adminUniqueTraitDto,
        replacementDataDto,
      );
    } catch (error) {
      if (error instanceof AdminNotFoundError) {
        throw new NotFoundException('Admin not found', {
          description: `There is no admin with id ${adminUniqueTraitDto.id}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete('/:id/')
  @LoggedInAs('superadmin')
  async delete(
    @Param()
    adminUniqueTraitDto: AdminUniqueTraitDto,
  ): Promise<AdminDto> {
    try {
      return await this.adminsService.delete(adminUniqueTraitDto);
    } catch (error) {
      if (error instanceof AdminNotFoundError) {
        throw new NotFoundException('Admin not found', {
          description: `There is no admin with id ${adminUniqueTraitDto.id}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
