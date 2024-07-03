import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  StreamableFile,
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
import { CriterionCreationDto } from './dtos/criterion-creation.dto';
import { CriterionFilters } from './schemas/criterion-filters.schema';
import { CriteriaService } from './criteria.service';

@Controller('/indicators/:indicatorIndex/criteria/')
@ApiTags('Criteria')
@LoggedInAs('superadmin', 'admin')
export class CriteriaController {
  constructor(
    private readonly criteriaRepository: CriteriaRepository,
    private readonly criteriaService: CriteriaService
  ) {}

  @Post()
  async createCriterion(
    @Param()
    indicatorIndexDto: CriterionIndicatorIndexDto,
    @Body()
    creationDataDto: CriterionCreationDto,
  ): Promise<CriterionDto> {
    const createdCriterionSchema =
      await this.criteriaService.createCriterion(
        CriterionCreation.parse({
          ...indicatorIndexDto,
          ...creationDataDto,
        }),
      );
    return CriterionDto.create(createdCriterionSchema);
  }

  @Get('/:subindex/')
  @LoggedInAs('unit')
  async findCriterion(
    @Param()
    uniqueTraitDto: CriterionUniqueTraitDto,
  ): Promise<CriterionDto> {
    const criterionSchema = await this.criteriaService.findCriterion(
      CriterionUniqueTrait.parse(uniqueTraitDto),
    );

    if (!criterionSchema) {
      throw new NotFoundException(
        'Criterion not found',
        `There is no criterion with index ${uniqueTraitDto.indicatorIndex}.${uniqueTraitDto.subindex}`,
      );
    }

    return CriterionDto.create(criterionSchema);
  }

  @Get('/:subindex/report')
  @Header('Content-Disposition', `attachment; filename="report.docx"`)
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  @LoggedInAs('unit')
  async getReport(
    @Param()
    uniqueTraitDto: CriterionUniqueTraitDto,
  ): Promise<StreamableFile> {
    const report = await this.criteriaService.generateReport(
      CriterionUniqueTrait.parse(uniqueTraitDto),
    );

    if (!report) {
      throw new NotFoundException(
        'Criterio no encontrado',
        `No pue ${uniqueTraitDto.indicatorIndex}.${uniqueTraitDto.subindex}`,
      );
    }

    return new StreamableFile(report);
  }

  @Get()
  @LoggedInAs('unit')
  async findCriteriaPage(
    @Param()
    indicatorIndexDto: CriterionIndicatorIndexDto,
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<CriteriaPageDto> {
    const criteriaSchemasPage = await this.criteriaService.findCriteriaPage(
      PaginationOptions.parse(paginationOptionsDto),
      CriterionFilters.parse(indicatorIndexDto),
    );

    const criteriaDtosPage = {
      ...criteriaSchemasPage,
      items: criteriaSchemasPage.items.map((criterionSchema) =>
        CriterionDto.create(criterionSchema),
      ),
    };

    return criteriaDtosPage;
  }

  @Put('/:subindex/')
  async replaceCriterion(
    @Param()
    uniqueTraitDto: CriterionUniqueTraitDto,
    @Body()
    replacementDataDto: CriterionReplacementDto,
  ): Promise<CriterionDto> {
    try {
      const newCriterionSchema = await this.criteriaService.replaceCriterion(
        CriterionUniqueTrait.parse(uniqueTraitDto),
        CriterionReplacement.parse({
          ...replacementDataDto,
          indicatorIndex: uniqueTraitDto.indicatorIndex,
        }),
      );

      return CriterionDto.create(newCriterionSchema);
    } catch (error) {
      if (error instanceof CriterionNotFoundError) {
        throw new NotFoundException('Criterion not found', {
          description: `There is no criterion with index ${uniqueTraitDto.indicatorIndex}.${uniqueTraitDto.subindex}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete('/:subindex/')
  async delete(
    @Param()
    uniqueTraitDto: CriterionUniqueTraitDto,
  ): Promise<CriterionDto> {
    try {
      const deletedCriterionSchema =
        await this.criteriaService.deleteCriterion(
          CriterionUniqueTrait.parse(uniqueTraitDto),
        );

      return CriterionDto.create(deletedCriterionSchema);
    } catch (error) {
      if (error instanceof CriterionNotFoundError) {
        throw new NotFoundException('Criterion not found', {
          description: `There is no criterion with index ${uniqueTraitDto.indicatorIndex}.${uniqueTraitDto.subindex}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
