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
import { zodToOpenAPI } from 'nestjs-zod';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import {
  EvidenceNotFoundError,
  EvidenceReplacementTypeMismatchError,
  EvidenceService,
} from 'src/evidence/evidence.service';
import { ManyUnitEvidenceCreationDto } from './dtos/many-unit-evidence-creation.dto';
import { ValidationPipe } from 'src/validation/validation.pipe';
import { UnitEvidenceDto } from './dtos/unit-evidence.dto';
import { UnitEvidenceActivityIdDto } from './dtos/unit-evidence-activity-id.dto';
import { UnitEvidenceUniqueTraitDto } from './dtos/unit-evidence-unique-trait.dto';
import { ActivityUniqueTraitDto } from 'src/evidence/dtos/activity-unique-trait.dto';
import { UserFromToken } from 'src/auth/user-from-token.decorator';
import { UserDto } from 'src/users/dtos/user.dto';
import { ManyEvidenceCreationDto } from 'src/evidence/dtos/many-evidence-creation.dto';
import { UnitEvidencePageDto } from './dtos/unit-evidence-page.dto';
import { UnitEvidenceReplacementDto } from './dtos/unit-evidence-replacement.dto';
import { EvidenceReplacementDto } from 'src/evidence/dtos/evidence-replacement.dto';

@Controller('/units/me/activities/:activityId/evidence/')
@ApiTags('Evidence of logged in units')
@LoggedInAs('unit')
export class UnitsEvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @ApiBody({ schema: zodToOpenAPI(ManyUnitEvidenceCreationDto) })
  async createMany(
    @Param()
    activityIdDto: UnitEvidenceActivityIdDto,
    @Body(new ValidationPipe(ManyUnitEvidenceCreationDto))
    creationDataDto: ManyUnitEvidenceCreationDto,
  ): Promise<UnitEvidenceDto[]> {
    const createdEvidence = await this.evidenceService.createMany(
      ActivityUniqueTraitDto.create(activityIdDto),
      ManyEvidenceCreationDto.parse(creationDataDto),
    );

    return createdEvidence.map((evidence) => UnitEvidenceDto.parse(evidence));
  }

  @Get('/:evidenceNumber/')
  async findOne(
    @Param()
    uniqueTraitDto: UnitEvidenceUniqueTraitDto,
    @UserFromToken()
    me: UserDto,
  ): Promise<UnitEvidenceDto> {
    const evidence = await this.evidenceService.findOne(uniqueTraitDto);

    if (!evidence) {
      throw new NotFoundException(
        'Evidencia no encontrada',
        `No hay evidencia Nro. ${uniqueTraitDto.evidenceNumber} para la actividad con ID ${uniqueTraitDto.activityId} realizado por la unidad con ID ${me.id}`,
      );
    }

    return UnitEvidenceDto.parse(evidence);
  }

  @Get()
  async findPage(
    @Param()
    activityIdDto: UnitEvidenceActivityIdDto,
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<UnitEvidencePageDto> {
    return await this.evidenceService.findPage(
      ActivityUniqueTraitDto.create(activityIdDto),
      paginationOptionsDto,
    );
  }

  @Put('/:evidenceNumber/')
  @ApiBody({ schema: zodToOpenAPI(UnitEvidenceReplacementDto) })
  async replace(
    @Param()
    uniqueTraitDto: UnitEvidenceUniqueTraitDto,
    @Body(new ValidationPipe(UnitEvidenceReplacementDto))
    replacementDataDto: UnitEvidenceReplacementDto,
    @UserFromToken()
    me: UserDto,
  ): Promise<UnitEvidenceDto> {
    try {
      const newEvidence = await this.evidenceService.replace(
        uniqueTraitDto,
        EvidenceReplacementDto.parse(replacementDataDto),
      );
      return UnitEvidenceDto.parse(newEvidence);
    } catch (error) {
      if (error instanceof EvidenceNotFoundError) {
        throw new NotFoundException('Unidad de Evidencia no encontrada', {
          description: `No hay evidencia Nro. ${uniqueTraitDto.evidenceNumber} para la actividad con ID ${uniqueTraitDto.activityId} realizado por la unidad con ID ${me.id}`,
          cause: error,
        });
      }
      if (error instanceof EvidenceReplacementTypeMismatchError) {
        throw new BadRequestException('Invalid type of evidence replacement', {
          description: `Un reemplazo de evidencia de ${error.expectedType} Se esperaba el tipo. Recibió un reemplazo de evidencia de ${error.receivedType} Tipo`,
          cause: error,
        });
      }
      throw error;
    }
  }

  @Delete('/:evidenceNumber/')
  async delete(
    @Param()
    uniqueTraitDto: UnitEvidenceUniqueTraitDto,
    @UserFromToken()
    me: UserDto,
  ): Promise<UnitEvidenceDto> {
    try {
      const deletedEvidence = await this.evidenceService.delete(uniqueTraitDto);
      return UnitEvidenceDto.parse(deletedEvidence);
    } catch (error) {
      if (error instanceof EvidenceNotFoundError) {
        throw new NotFoundException('Unidad de Evidencia no encontrada', {
          description: `No hay evidencia Nro. ${uniqueTraitDto.evidenceNumber} Para la actividad con ID ${uniqueTraitDto.activityId} realizado por la unidad con ID ${me.id}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
