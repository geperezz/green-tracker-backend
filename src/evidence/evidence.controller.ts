import {
  BadRequestException,
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
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { zodToOpenAPI } from 'nestjs-zod';

import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import {
  EvidenceNotFoundError,
  EvidenceReplacementTypeMismatchError,
  EvidenceService,
} from './evidence.service';
import { EvidenceDto } from './dtos/evidence.dto';
import { EvidenceUniqueTraitDto } from './dtos/evidence-unique-trait.dto';
import { EvidencePageDto } from './dtos/evidence-page.dto';
import {
  EvidenceReplacementDto,
  evidenceReplacementDtoSchema,
} from './dtos/evidence-replacement.dto';
import { ActivityUniqueTraitDto } from './dtos/activity-unique-trait.dto';
import { ValidationPipe } from 'src/validation/validation.pipe';
import {
  ManyEvidenceCreationDto,
  manyEvidenceCreationDtoSchema,
} from './dtos/many-evidence-creation.dto';

@Controller('/activity/:activityId/evidence/')
@ApiTags('Evidence')
@LoggedInAs('superadmin', 'admin')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @ApiBody({ schema: zodToOpenAPI(manyEvidenceCreationDtoSchema) })
  async createMany(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    @Body(new ValidationPipe(manyEvidenceCreationDtoSchema))
    creationDataDto: ManyEvidenceCreationDto,
  ): Promise<EvidenceDto[]> {
    return await this.evidenceService.createMany(
      activityUniqueTraitDto,
      creationDataDto,
    );
  }

  @Get('/:evidenceNumber/')
  async findOne(
    @Param()
    evidenceUniqueTraitDto: EvidenceUniqueTraitDto,
  ): Promise<EvidenceDto> {
    const evidence = await this.evidenceService.findOne(evidenceUniqueTraitDto);

    if (!evidence) {
      throw new NotFoundException(
        'Evidence not found',
        `There is no evidence No. ${evidenceUniqueTraitDto.evidenceNumber} for the activity with ID ${evidenceUniqueTraitDto.activityId}`,
      );
    }

    return evidence;
  }

  @Get()
  async findPage(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<EvidencePageDto> {
    return await this.evidenceService.findPage(
      activityUniqueTraitDto,
      paginationOptionsDto,
    );
  }

  @Put('/:evidenceNumber/')
  @ApiBody({ schema: zodToOpenAPI(evidenceReplacementDtoSchema) })
  async replace(
    @Param()
    evidenceUniqueTraitDto: EvidenceUniqueTraitDto,
    @Body(new ValidationPipe(evidenceReplacementDtoSchema))
    replacementDataDto: EvidenceReplacementDto,
  ): Promise<EvidenceDto> {
    try {
      return await this.evidenceService.replace(
        evidenceUniqueTraitDto,
        replacementDataDto,
      );
    } catch (error) {
      if (error instanceof EvidenceNotFoundError) {
        throw new NotFoundException('Evidence not found', {
          description: `There is no evidence No. ${evidenceUniqueTraitDto.evidenceNumber} for the activity with ID ${evidenceUniqueTraitDto.activityId}`,
          cause: error,
        });
      }
      if (error instanceof EvidenceReplacementTypeMismatchError) {
        throw new BadRequestException('Invalid type of evidence replacement', {
          description: `An evidence replacement of ${error.expectedType} type was expected. Received an evidence replacement of ${error.receivedType} type`,
          cause: error,
        });
      }
      throw error;
    }
  }

  @Delete('/:evidenceNumber/')
  async delete(
    @Param()
    evidenceUniqueTraitDto: EvidenceUniqueTraitDto,
  ): Promise<EvidenceDto> {
    try {
      return await this.evidenceService.delete(evidenceUniqueTraitDto);
    } catch (error) {
      if (error instanceof EvidenceNotFoundError) {
        throw new NotFoundException('Evidence not found', {
          description: `There is no evidence No. ${evidenceUniqueTraitDto.evidenceNumber} for the activity with ID ${evidenceUniqueTraitDto.activityId}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
