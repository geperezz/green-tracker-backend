import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import { ActivityUniqueTraitDto } from 'src/evidence/dtos/activity-unique-trait.dto';
import { LinkEvidenceCreationDto } from './dtos/link-evidence-creation.dto';
import { LinkEvidenceDto } from './dtos/link-evidence.dto';
import {
  LinkEvidenceNotFoundError,
  LinkEvidenceService,
} from './link-evidence.service';
import { EvidenceUniqueTraitDto } from 'src/evidence/dtos/evidence-unique-trait.dto';
import { LinkEvidenceReplacementDto } from './dtos/link-evidence-replacement.dto';
import { ActivitiesRepository } from 'src/activities/activities.repository';
import { UserFromToken } from 'src/auth/user-from-token.decorator';
import { UserDto } from 'src/users/dtos/user.dto';
import { ActivityUniqueTrait } from 'src/activities/schemas/activity-unique-trait.schema';

@Controller('/activity/:activityId/link-evidence/')
@ApiTags('Link evidence')
@LoggedInAs('any')
export class LinkEvidenceController {
  constructor(
    private linkEvidenceService: LinkEvidenceService,
    private activitiesRepository: ActivitiesRepository,
  ) {}

  @Post()
  async createLinkEvidence(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    @Body()
    creationDataDto: LinkEvidenceCreationDto,
    @UserFromToken()
    user: UserDto,
  ): Promise<LinkEvidenceDto> {
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

    return await this.linkEvidenceService.createLinkEvidence(
      activityUniqueTraitDto,
      creationDataDto,
    );
  }

  @Get('all')
  async findAllLinkEvidence(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
  ): Promise<LinkEvidenceDto[]> {
    return await this.linkEvidenceService.findAllLinkEvidence(
      activityUniqueTraitDto,
    );
  }

  @Get(':evidenceNumber')
  async findLinkEvidence(
    @Param()
    uniqueTraitDto: EvidenceUniqueTraitDto,
  ): Promise<LinkEvidenceDto> {
    const linkEvidence =
      await this.linkEvidenceService.findLinkEvidence(uniqueTraitDto);
    if (!linkEvidence) {
      throw new NotFoundException(
        'Link evidence not found',
        `There is no link evidence No. ${uniqueTraitDto.evidenceNumber} for the activity with ID ${uniqueTraitDto.activityId}`,
      );
    }
    return linkEvidence;
  }

  @Put(':evidenceNumber')
  async replaceLinkEvidence(
    @Param()
    uniqueTraitDto: EvidenceUniqueTraitDto,
    @Body()
    replacementDataDto: LinkEvidenceReplacementDto,
    @UserFromToken()
    user: UserDto,
  ): Promise<LinkEvidenceDto> {
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
      return await this.linkEvidenceService.replaceLinkEvidence(
        uniqueTraitDto,
        replacementDataDto,
      );
    } catch (error) {
      if (error instanceof LinkEvidenceNotFoundError) {
        throw new NotFoundException('Link evidence not found', {
          description: `There is no link evidence No. ${uniqueTraitDto.evidenceNumber} for the activity with ID ${uniqueTraitDto.activityId}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete(':evidenceNumber')
  async deleteLinkEvidence(
    @Param()
    uniqueTraitDto: EvidenceUniqueTraitDto,
    @UserFromToken()
    user: UserDto,
  ): Promise<LinkEvidenceDto> {
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
      return await this.linkEvidenceService.deleteLinkEvidence(uniqueTraitDto);
    } catch (error) {
      if (error instanceof LinkEvidenceNotFoundError) {
        throw new NotFoundException('Link evidence not found', {
          description: `There is no link evidence No. ${uniqueTraitDto.evidenceNumber} for the activity with ID ${uniqueTraitDto.activityId}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
