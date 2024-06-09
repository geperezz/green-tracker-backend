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
import { UnitNotFoundError, UnitsService } from './units.service';
import { UnitCreationDto } from './dtos/unit-creation.dto';
import { UnitDto } from './dtos/unit.dto';
import { UnitUniqueTraitDto } from './dtos/unit-unique-trait.dto';
import { UnitsPageDto } from './dtos/units-page.dto';
import { UnitReplacementDto } from './dtos/unit-replacement.dto';
import { UserFromToken } from 'src/auth/user-from-token.decorator';
import { UserDto } from 'src/users/dtos/user.dto';

@Controller('/units/')
@ApiTags('Units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @LoggedInAs('superadmin', 'admin')
  async create(
    @Body()
    creationDataDto: UnitCreationDto,
  ): Promise<UnitDto> {
    return await this.unitsService.create(creationDataDto);
  }

  @Get('/me/')
  @LoggedInAs('unit')
  async findMe(
    @UserFromToken()
    me: UserDto,
  ): Promise<UnitDto> {
    const unit = await this.unitsService.findOne(
      UnitUniqueTraitDto.create({ id: me.id }),
    );

    if (!unit) {
      throw new NotFoundException(
        'Unit not found',
        `There is no unit with id ${me.id}`,
      );
    }

    return unit;
  }

  @Get('/:id/')
  @LoggedInAs('superadmin', 'admin')
  async findOne(
    @Param()
    unitUniqueTraitDto: UnitUniqueTraitDto,
  ): Promise<UnitDto> {
    const unit = await this.unitsService.findOne(unitUniqueTraitDto);

    if (!unit) {
      throw new NotFoundException(
        'Unit not found',
        `There is no unit with id ${unitUniqueTraitDto.id}`,
      );
    }

    return unit;
  }

  @Get()
  @LoggedInAs('superadmin', 'admin')
  async findPage(
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<UnitsPageDto> {
    return await this.unitsService.findPage(paginationOptionsDto);
  }

  @Put('/:id/')
  @LoggedInAs('superadmin', 'admin')
  async replace(
    @Param()
    unitUniqueTraitDto: UnitUniqueTraitDto,
    @Body()
    replacementDataDto: UnitReplacementDto,
  ): Promise<UnitDto> {
    try {
      return await this.unitsService.replace(
        unitUniqueTraitDto,
        replacementDataDto,
      );
    } catch (error) {
      if (error instanceof UnitNotFoundError) {
        throw new NotFoundException('Unit not found', {
          description: `There is no unit with id ${unitUniqueTraitDto.id}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete('/:id/')
  @LoggedInAs('superadmin', 'admin')
  async delete(
    @Param()
    unitUniqueTraitDto: UnitUniqueTraitDto,
  ): Promise<UnitDto> {
    try {
      return await this.unitsService.delete(unitUniqueTraitDto);
    } catch (error) {
      if (error instanceof UnitNotFoundError) {
        throw new NotFoundException('Unit not found', {
          description: `There is no unit with id ${unitUniqueTraitDto.id}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
