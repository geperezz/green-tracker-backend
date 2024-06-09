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
import { CriterionDto } from './dtos/criterion.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { CriteriaPageDto } from './dtos/criteria-page.dto';
import { CriterionReplacementDto } from './dtos/criterion-replacement.dto';
import { CriterionUniqueTraitDto } from './dtos/criterion-unique-trait.dto';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { CriterionCreation } from './schemas/criterion-creation.schema';
import { CriterionUniqueTrait } from './schemas/criterion-unique-trait.schema';
import { CriterionReplacement } from './schemas/criterion-replacement.schema';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import { CriterionIndicatorIndexDto } from './dtos/criterion-indicator-index.dto';
import { CriterionIndicatorIndex } from './schemas/criterion-indicator-index.schema';
import { CriterionCreationPathDto } from './dtos/criterion-creation-path.dto';
import { CriterionCreationBodyDto } from './dtos/criterion-creation-body.dto';
import { CriterionCreationPath } from './schemas/criterion-creation-path.schema';

@Controller('/indicators/:indicatorIndex/criteria/')
@ApiTags('Criteria')
@LoggedInAs('superadmin', 'admin')
export class CriteriaController {
  constructor(private readonly criteriaRepository: CriteriaRepository) {}

  @Post()
  async create(
    @Param()
    creationPathDto: CriterionCreationPathDto,
    @Body()
    creationDataDto: CriterionCreationBodyDto,
  ): Promise<CriterionDto> {
    const combinedData = {
      ...creationPathDto,
      ...creationDataDto,
    };
    
    const createdCriterionSchema = await this.criteriaRepository.create(
      CriterionCreation.parse(combinedData),
    );
    return CriterionDto.fromSchema(createdCriterionSchema);
  }

  @Get('/:subindex/')
  @LoggedInAs('unit')
  async findOne(
    @Param()
    criterionUniqueTraitDto: CriterionUniqueTraitDto,
  ): Promise<CriterionDto> {
    const criterionSchema = await this.criteriaRepository.findOne(
      CriterionUniqueTrait.parse(criterionUniqueTraitDto),
    );

    if (!criterionSchema) {
      throw new NotFoundException(
        'Criterion not found',
        `There is no criterion with index ${criterionUniqueTraitDto.indicatorIndex}.${criterionUniqueTraitDto.subindex}`,
      );
    }

    return CriterionDto.fromSchema(criterionSchema);
  }

  @Get()
  @LoggedInAs('unit')
  async findPage(
    @Param()
    criterionIndicatorIndexDto: CriterionIndicatorIndexDto,
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<CriteriaPageDto> {
    const criterionSchemasPage = await this.criteriaRepository.findPage(
      CriterionIndicatorIndex.parse(criterionIndicatorIndexDto),
      PaginationOptions.parse(paginationOptionsDto),
    );

    const criterionDtosPage = {
      ...criterionSchemasPage,
      items: criterionSchemasPage.items.map((criterionSchema) =>
        CriterionDto.fromSchema(criterionSchema),
      ),
    };

    return criterionDtosPage;
  }

  @Put('/:subindex/')
  async replace(
    @Param()
    criterionUniqueTraitDto: CriterionUniqueTraitDto,
    @Body()
    replacementDataDto: CriterionReplacementDto,
  ): Promise<CriterionDto> {
    const combinedData = {
      indicatorIndex: criterionUniqueTraitDto.indicatorIndex,
      ...replacementDataDto,
    };

    try {
      const newCriterionSchema = await this.criteriaRepository.replace(
        CriterionUniqueTrait.parse(criterionUniqueTraitDto),
        CriterionReplacement.parse(combinedData),
      );

      return CriterionDto.fromSchema(newCriterionSchema);
    } catch (error) {
      if (error instanceof CriterionNotFoundError) {
        throw new NotFoundException('Criterion not found', {
          description: `There is no criterion with index ${criterionUniqueTraitDto.indicatorIndex}.${criterionUniqueTraitDto.subindex}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete('/:subindex/')
  async delete(
    @Param()
    criterionUniqueTraitDto: CriterionUniqueTraitDto,
  ): Promise<CriterionDto> {
    try {
      const deletedCriterionSchema = await this.criteriaRepository.delete(
        CriterionUniqueTrait.parse(criterionUniqueTraitDto),
      );

      return CriterionDto.fromSchema(deletedCriterionSchema);
    } catch (error) {
      if (error instanceof CriterionNotFoundError) {
        throw new NotFoundException('Criterion not found', {
          description: `There is no criterion with index ${criterionUniqueTraitDto.indicatorIndex}.${criterionUniqueTraitDto.subindex}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
