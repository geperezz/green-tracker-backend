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
import { IndicatorIndexDto } from './dtos/indicator-index.dto';

@Controller('/indicators/')
@ApiTags('Indicators')
export class IndicatorsController {
  constructor(private readonly indicatorsRepository: IndicatorsRepository) {}

  @Post()
  async create(
    @Body()
    creationDataDto: IndicatorCreationDto,
  ): Promise<IndicatorDto> {
    const createdIndicatorSchema =
      await this.indicatorsRepository.create(creationDataDto);
    return IndicatorDto.fromSchema(createdIndicatorSchema);
  }

  @Get('/:index/')
  async findOne(
    @Param()
    indicatorIndexDto: IndicatorIndexDto,
  ): Promise<IndicatorDto> {
    const indicatorSchema = await this.indicatorsRepository.findOne(
      indicatorIndexDto.index,
    );

    if (!indicatorSchema) {
      throw new NotFoundException(
        'Indicator not found',
        `There is no indicator with index ${indicatorIndexDto.index}`,
      );
    }

    return IndicatorDto.fromSchema(indicatorSchema);
  }

  @Get()
  async findPage(
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<IndicatorsPageDto> {
    const indicatorSchemasPage = await this.indicatorsRepository.findPage(
      PaginationOptionsDto.toSchema(paginationOptionsDto),
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
    indicatorIndexDto: IndicatorIndexDto,
    @Body()
    replacementDataDto: IndicatorReplacementDto,
  ): Promise<IndicatorDto> {
    try {
      const newIndicatorSchema = await this.indicatorsRepository.replace(
        indicatorIndexDto.index,
        replacementDataDto,
      );

      return IndicatorDto.fromSchema(newIndicatorSchema);
    } catch (error) {
      if (error instanceof IndicatorNotFoundError) {
        throw new NotFoundException('Indicator not found', {
          description: `There is no indicator with index ${indicatorIndexDto.index}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete('/:index/')
  async delete(
    @Param()
    indicatorIndexDto: IndicatorIndexDto,
  ): Promise<IndicatorDto> {
    try {
      const deletedIndicatorSchema = await this.indicatorsRepository.delete(
        indicatorIndexDto.index,
      );

      return IndicatorDto.fromSchema(deletedIndicatorSchema);
    } catch (error) {
      if (error instanceof IndicatorNotFoundError) {
        throw new NotFoundException('Indicator not found', {
          description: `There is no indicator with index ${indicatorIndexDto.index}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
