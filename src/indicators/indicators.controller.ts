import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  BadRequestException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IndicatorCreationDto } from './dtos/indicator-creation.dto';
import { IndicatorDto } from './dtos/indicator.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { IndicatorsPageDto } from './dtos/indicators-page.dto';
import { IndicatorReplacementDto } from './dtos/indicator-replacement.dto';
import { IndicatorUniqueTraitDto } from './dtos/indicator-unique-trait.dto';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import {
  IndicatorNotFoundError,
  IndicatorAlreadyExistsError,
  IndicatorsService,
} from './indicators.service';

@Controller('/indicators/')
@ApiTags('Indicators')
@LoggedInAs('superadmin', 'admin')
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  @Post()
  async create(
    @Body()
    creationDataDto: IndicatorCreationDto,
  ): Promise<IndicatorDto> {
    try {
      return await this.indicatorsService.create(creationDataDto);
    } catch (error) {
      if (error instanceof IndicatorAlreadyExistsError) {
        throw new BadRequestException(error.message, { cause: error.cause });
      }
      throw error;
    }
  }

  @Get()
  @LoggedInAs('unit')
  async findPage(
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<IndicatorsPageDto> {
    return await this.indicatorsService.findPage(paginationOptionsDto);
  }

  @Get('/all/')
  @LoggedInAs('unit')
  async findAll(): Promise<IndicatorDto[]> {
    return await this.indicatorsService.findAll();
  }

  @Get('/:index/')
  @LoggedInAs('unit')
  async findOne(
    @Param()
    indicatorUniqueTraitDto: IndicatorUniqueTraitDto,
  ): Promise<IndicatorDto> {
    const indicator = await this.indicatorsService.findOne(
      indicatorUniqueTraitDto,
    );

    if (!indicator) {
      throw new NotFoundException(
        'Indicator not found',
        `There is no indicator with index ${indicatorUniqueTraitDto.index}`,
      );
    }

    return indicator;
  }

  @Put('/:index/')
  async replace(
    @Param()
    indicatorUniqueTraitDto: IndicatorUniqueTraitDto,
    @Body()
    replacementDataDto: IndicatorReplacementDto,
  ): Promise<IndicatorDto> {
    try {
      return await this.indicatorsService.replace(
        indicatorUniqueTraitDto,
        replacementDataDto,
      );
    } catch (error) {
      if (error instanceof IndicatorNotFoundError) {
        throw new NotFoundException('Indicator not found', {
          description: `There is no indicator with index ${indicatorUniqueTraitDto.index}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete('/:index/')
  async delete(
    @Param()
    indicatorUniqueTraitDto: IndicatorUniqueTraitDto,
  ): Promise<IndicatorDto> {
    try {
      return await this.indicatorsService.delete(indicatorUniqueTraitDto);
    } catch (error) {
      if (error instanceof IndicatorNotFoundError) {
        throw new NotFoundException('Indicator not found', {
          description: `There is no indicator with index ${indicatorUniqueTraitDto.index}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
