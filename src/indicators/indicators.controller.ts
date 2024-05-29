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

import {
  IndicatorNotFoundError,
  IndicatorsRepository,
} from './indicators.repository';
import { IndicatorCreationDto } from './dtos/indicator-creation.dto';
import { IndicatorDto } from './dtos/indicator.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { IndicatorsPageDto } from './dtos/indicators-page.dto';
import { IndicatorReplacementDto } from './dtos/indicator-replacement.dto';
import { IndicatorUniqueTraitDto } from './dtos/indicator-unique-trait.dto';
import { IndicatorCreation } from './schemas/indicator-creation.schema';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { IndicatorUniqueTrait } from './schemas/indicator-unique-trait.schema';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import { IndicatorReplacement } from './schemas/indicator-replacement.schema';

@Controller('/indicators/')
@ApiTags('Indicators')
@LoggedInAs('superadmin', 'admin')
export class IndicatorsController {
  constructor(private readonly indicatorsRepository: IndicatorsRepository) {}

  @Post()
  async create(
    @Body()
    creationDataDto: IndicatorCreationDto,
  ): Promise<IndicatorDto> {
    const createdIndicatorSchema = await this.indicatorsRepository.create(
      IndicatorCreation.parse(creationDataDto),
    );
    return IndicatorDto.fromSchema(createdIndicatorSchema);
  }

  @Get('/:index/')
  @LoggedInAs('unit')
  async findOne(
    @Param()
    indicatorUniqueTraitDto: IndicatorUniqueTraitDto,
  ): Promise<IndicatorDto> {
    const indicatorSchema = await this.indicatorsRepository.findOne(
      IndicatorUniqueTrait.parse(indicatorUniqueTraitDto),
    );

    if (!indicatorSchema) {
      throw new NotFoundException(
        'Indicator not found',
        `There is no indicator with index ${indicatorUniqueTraitDto.index}`,
      );
    }

    return IndicatorDto.fromSchema(indicatorSchema);
  }

  @Get()
  @LoggedInAs('unit')
  async findPage(
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<IndicatorsPageDto> {
    const indicatorSchemasPage = await this.indicatorsRepository.findPage(
      PaginationOptions.parse(paginationOptionsDto),
    );

    const indicatorDtosPage = {
      ...indicatorSchemasPage,
      items: indicatorSchemasPage.items.map((indicatorSchema) =>
        IndicatorDto.fromSchema(indicatorSchema),
      ),
    };

    return indicatorDtosPage;
  }

  @Put('/:index/')
  async replace(
    @Param()
    indicatorUniqueTraitDto: IndicatorUniqueTraitDto,
    @Body()
    replacementDataDto: IndicatorReplacementDto,
  ): Promise<IndicatorDto> {
    try {
      const newIndicatorSchema = await this.indicatorsRepository.replace(
        IndicatorUniqueTrait.parse(indicatorUniqueTraitDto),
        IndicatorReplacement.parse(replacementDataDto),
      );

      return IndicatorDto.fromSchema(newIndicatorSchema);
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
      const deletedIndicatorSchema = await this.indicatorsRepository.delete(
        IndicatorUniqueTrait.parse(indicatorUniqueTraitDto),
      );

      return IndicatorDto.fromSchema(deletedIndicatorSchema);
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
