import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import { ActivityUniqueTraitDto } from 'src/evidence/dtos/activity-unique-trait.dto';
import {
  DocumentEvidenceCreationDto,
  documentEvidenceCreationDtoSwaggerSchema,
} from './dtos/document-evidence-creation.dto';
import { DocumentEvidenceDto } from './dtos/document-evidence.dto';
import {
  DocumentEvidenceNotFoundError,
  DocumentEvidenceService,
} from './document-evidence.service';
import { EvidenceUniqueTraitDto } from 'src/evidence/dtos/evidence-unique-trait.dto';
import {
  DocumentEvidenceReplacementDto,
  documentEvidenceReplacementDtoSwaggerSchema,
} from './dtos/document-evidence-replacement.dto';
import { ActivitiesRepository } from 'src/activities/activities.repository';
import { UserFromToken } from 'src/auth/user-from-token.decorator';
import { UserDto } from 'src/users/dtos/user.dto';
import { ActivityUniqueTrait } from 'src/activities/schemas/activity-unique-trait.schema';

@Controller('/activity/:activityId/document-evidence/')
@ApiTags('Document evidence')
@LoggedInAs('any')
export class DocumentEvidenceController {
  constructor(
    private documentEvidenceService: DocumentEvidenceService,
    private activitiesRepository: ActivitiesRepository,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: documentEvidenceCreationDtoSwaggerSchema })
  @UseInterceptors(FileInterceptor('documentFile'))
  async createDocumentEvidence(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    @Body()
    creationDataDto: DocumentEvidenceCreationDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)/,
          }),
        ],
      }),
    )
    documentFile: Express.Multer.File,
    @UserFromToken()
    user: UserDto,
  ): Promise<DocumentEvidenceDto> {
    if (user.role === 'unit') {
      const activity = await this.activitiesRepository.findOne(
        ActivityUniqueTrait.parse({ id: activityUniqueTraitDto.activityId }),
      );

      if (!activity) {
        throw new NotFoundException(
          'Activity not found',
          `There is no activity with ID ${activityUniqueTraitDto.activityId}`,
        );
      }

      if (activity.unitId !== user.id) {
        throw new ForbiddenException(
          `You are not allowed to create new evidence for the activity with ID ${activityUniqueTraitDto.activityId}`,
        );
      }
    }

    return await this.documentEvidenceService.createDocumentEvidence(
      activityUniqueTraitDto,
      creationDataDto,
      documentFile,
    );
  }

  @Get('all')
  async findAllDocumentEvidence(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
  ): Promise<DocumentEvidenceDto[]> {
    return await this.documentEvidenceService.findAllDocumentEvidence(
      activityUniqueTraitDto,
    );
  }

  @Get(':evidenceNumber')
  async findDocumentEvidence(
    @Param()
    uniqueTraitDto: EvidenceUniqueTraitDto,
  ): Promise<DocumentEvidenceDto> {
    const documentEvidence =
      await this.documentEvidenceService.findDocumentEvidence(uniqueTraitDto);
    if (!documentEvidence) {
      throw new NotFoundException(
        'Document evidence not found',
        `There is no document evidence No. ${uniqueTraitDto.evidenceNumber} for the activity with ID ${uniqueTraitDto.activityId}`,
      );
    }
    return documentEvidence;
  }

  @Put(':evidenceNumber')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: documentEvidenceReplacementDtoSwaggerSchema })
  @UseInterceptors(FileInterceptor('documentFile'))
  async replaceDocumentEvidence(
    @Param()
    uniqueTraitDto: EvidenceUniqueTraitDto,
    @Body()
    replacementDataDto: DocumentEvidenceReplacementDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)/,
          }),
        ],
      }),
    )
    documentFile: Express.Multer.File,
    @UserFromToken()
    user: UserDto,
  ): Promise<DocumentEvidenceDto> {
    if (user.role === 'unit') {
      const activity = await this.activitiesRepository.findOne(
        ActivityUniqueTrait.parse({ id: uniqueTraitDto.activityId }),
      );

      if (!activity) {
        throw new NotFoundException(
          'Activity not found',
          `There is no activity with ID ${uniqueTraitDto.activityId}`,
        );
      }

      if (activity.unitId !== user.id) {
        throw new ForbiddenException(
          `You are not allowed to update existing evidence for the activity with ID ${uniqueTraitDto.activityId}`,
        );
      }
    }

    try {
      return await this.documentEvidenceService.replaceDocumentEvidence(
        uniqueTraitDto,
        replacementDataDto,
        documentFile,
      );
    } catch (error) {
      if (error instanceof DocumentEvidenceNotFoundError) {
        throw new NotFoundException('Document evidence not found', {
          description: `There is no document evidence No. ${uniqueTraitDto.evidenceNumber} for the activity with ID ${uniqueTraitDto.activityId}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete(':evidenceNumber')
  async deleteDocumentEvidence(
    @Param()
    uniqueTraitDto: EvidenceUniqueTraitDto,
    @UserFromToken()
    user: UserDto,
  ): Promise<DocumentEvidenceDto> {
    if (user.role === 'unit') {
      const activity = await this.activitiesRepository.findOne(
        ActivityUniqueTrait.parse({ id: uniqueTraitDto.activityId }),
      );

      if (!activity) {
        throw new NotFoundException(
          'Activity not found',
          `There is no activity with ID ${uniqueTraitDto.activityId}`,
        );
      }

      if (activity.unitId !== user.id) {
        throw new ForbiddenException(
          `You are not allowed to delete existing evidence for the activity with ID ${uniqueTraitDto.activityId}`,
        );
      }
    }

    try {
      return await this.documentEvidenceService.deleteDocumentEvidence(
        uniqueTraitDto,
      );
    } catch (error) {
      if (error instanceof DocumentEvidenceNotFoundError) {
        throw new NotFoundException('Document evidence not found', {
          description: `There is no document evidence No. ${uniqueTraitDto.evidenceNumber} for the activity with ID ${uniqueTraitDto.activityId}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
