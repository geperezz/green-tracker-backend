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
  ImageEvidenceCreationDto,
  imageEvidenceCreationDtoSwaggerSchema,
} from './dtos/image-evidence-creation.dto';
import { ImageEvidenceDto } from './dtos/image-evidence.dto';
import {
  ImageEvidenceNotFoundError,
  ImageEvidenceService,
} from './image-evidence.service';
import { EvidenceUniqueTraitDto } from 'src/evidence/dtos/evidence-unique-trait.dto';
import {
  ImageEvidenceReplacementDto,
  imageEvidenceReplacementDtoSwaggerSchema,
} from './dtos/image-evidence-replacement.dto';
import { ActivitiesRepository } from 'src/activities/activities.repository';
import { UserFromToken } from 'src/auth/user-from-token.decorator';
import { UserDto } from 'src/users/dtos/user.dto';
import { ActivityUniqueTrait } from 'src/activities/schemas/activity-unique-trait.schema';

@Controller('/activity/:activityId/image-evidence/')
@ApiTags('Image evidence')
@LoggedInAs('any')
export class ImageEvidenceController {
  constructor(
    private imageEvidenceService: ImageEvidenceService,
    private activitiesRepository: ActivitiesRepository,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: imageEvidenceCreationDtoSwaggerSchema })
  @UseInterceptors(FileInterceptor('imageFile'))
  async createImageEvidence(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    @Body()
    creationDataDto: ImageEvidenceCreationDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /image\/(jpeg|png)/ })],
      }),
    )
    imageFile: Express.Multer.File,
    @UserFromToken()
    user: UserDto,
  ): Promise<ImageEvidenceDto> {
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

    return await this.imageEvidenceService.createImageEvidence(
      activityUniqueTraitDto,
      creationDataDto,
      imageFile,
    );
  }

  @Get('all')
  async findAllImageEvidence(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
  ): Promise<ImageEvidenceDto[]> {
    return await this.imageEvidenceService.findAllImageEvidence(
      activityUniqueTraitDto,
    );
  }

  @Get(':evidenceNumber')
  async findImageEvidence(
    @Param()
    uniqueTraitDto: EvidenceUniqueTraitDto,
  ): Promise<ImageEvidenceDto> {
    const imageEvidence =
      await this.imageEvidenceService.findImageEvidence(uniqueTraitDto);
    if (!imageEvidence) {
      throw new NotFoundException(
        'Image evidence not found',
        `There is no image evidence No. ${uniqueTraitDto.evidenceNumber} for the activity with ID ${uniqueTraitDto.activityId}`,
      );
    }
    return imageEvidence;
  }

  @Put(':evidenceNumber')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: imageEvidenceReplacementDtoSwaggerSchema })
  @UseInterceptors(FileInterceptor('imageFile'))
  async replaceImageEvidence(
    @Param()
    uniqueTraitDto: EvidenceUniqueTraitDto,
    @Body()
    replacementDataDto: ImageEvidenceReplacementDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /image\/(jpeg|png)/ })],
      }),
    )
    imageFile: Express.Multer.File,
    @UserFromToken()
    user: UserDto,
  ): Promise<ImageEvidenceDto> {
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
      return await this.imageEvidenceService.replaceImageEvidence(
        uniqueTraitDto,
        replacementDataDto,
        imageFile,
      );
    } catch (error) {
      if (error instanceof ImageEvidenceNotFoundError) {
        throw new NotFoundException('Image evidence not found', {
          description: `There is no image evidence No. ${uniqueTraitDto.evidenceNumber} for the activity with ID ${uniqueTraitDto.activityId}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete(':evidenceNumber')
  async deleteImageEvidence(
    @Param()
    uniqueTraitDto: EvidenceUniqueTraitDto,
    @UserFromToken()
    user: UserDto,
  ): Promise<ImageEvidenceDto> {
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
      return await this.imageEvidenceService.deleteImageEvidence(
        uniqueTraitDto,
      );
    } catch (error) {
      if (error instanceof ImageEvidenceNotFoundError) {
        throw new NotFoundException('Image evidence not found', {
          description: `There is no image evidence No. ${uniqueTraitDto.evidenceNumber} for the activity with ID ${uniqueTraitDto.activityId}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
