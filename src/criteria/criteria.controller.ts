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
  CriterionNotFoundError,
  CriteriaRepository,
} from './criteria.repository';
import { CriterionCreationDto } from './dtos/criterion-creation.dto';
import { CriterionDto } from './dtos/criterion.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { CriteriaPageDto } from './dtos/criteria-page.dto';
import { CriterionReplacementDto } from './dtos/criterion-replacement.dto';
import { CriterionIndexDto } from './dtos/criterion-index.dto';

@Controller('/criteria/')
@ApiTags('Criteria')
export class CriteriaController {
  constructor(private readonly criteriaRepository: CriteriaRepository) {}

  @Post()
  async create(
    @Body()
    creationDataDto: CriterionCreationDto,
  ): Promise<CriterionDto> {
    const createdCriterionSchema =
      await this.criteriaRepository.create(creationDataDto);
    return CriterionDto.fromSchema(createdCriterionSchema);
  }

  @Get('/:indicatorIndex/:subindex')
  async findOne(
    @Param()
    criterionIndexDto: CriterionIndexDto,
  ): Promise<CriterionDto> {
    const criterionSchema = await this.criteriaRepository.findOne(
      criterionIndexDto.indicatorIndex,
      criterionIndexDto.subindex,
    );

    if (!criterionSchema) {
      throw new NotFoundException(
        'Criterion not found',
        `There is no criterion with index ${criterionIndexDto.indicatorIndex}.${criterionIndexDto.subindex}`,
      );
    }

    return CriterionDto.fromSchema(criterionSchema);
  }

  @Get()
  async findPage(
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<CriteriaPageDto> {
    const criterionSchemasPage = await this.criteriaRepository.findPage(
      PaginationOptionsDto.toSchema(paginationOptionsDto),
    );

    const criterionDtosPage = {
      ...criterionSchemasPage,
      items: criterionSchemasPage.items.map((criterionSchema) =>
        CriterionDto.fromSchema(criterionSchema),
      ),
    };

    return criterionDtosPage;
  }

  @Put('/:indicatorIndex/:subindex')
  async replace(
    @Param()
    criterionIndexDto: CriterionIndexDto,
    @Body()
    replacementDataDto: CriterionReplacementDto,
  ): Promise<CriterionDto> {
    try {
      const newCriterionSchema = await this.criteriaRepository.replace(
        criterionIndexDto.indicatorIndex,
        criterionIndexDto.subindex,
        replacementDataDto,
      );

      return CriterionDto.fromSchema(newCriterionSchema);
    } catch (error) {
      if (error instanceof CriterionNotFoundError) {
        throw new NotFoundException('Criterion not found', {
          description: `There is no criterion with index ${criterionIndexDto.indicatorIndex}.${criterionIndexDto.subindex}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete('/:indicatorIndex/:subindex')
  async delete(
    @Param()
    criterionIndexDto: CriterionIndexDto,
  ): Promise<CriterionDto> {
    try {
      const deletedCriterionSchema = await this.criteriaRepository.delete(
        criterionIndexDto.indicatorIndex,
        criterionIndexDto.subindex,
      );

      return CriterionDto.fromSchema(deletedCriterionSchema);
    } catch (error) {
      if (error instanceof CriterionNotFoundError) {
        throw new NotFoundException('Criterion not found', {
          description: `There is no criterion with index ${criterionIndexDto.indicatorIndex}.${criterionIndexDto.subindex}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
