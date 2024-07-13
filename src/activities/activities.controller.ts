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
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActivityCreationDto } from './dtos/activity-creation.dto';
import { ActivityDto } from './dtos/activity.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { ActivitiesPageDto } from './dtos/activities-page.dto';
import { ActivityReplacementDto } from './dtos/activity-replacement.dto';
import { ActivityUniqueTraitDto } from './dtos/activity-unique-trait.dto';
import { ActivityUniqueTrait } from './schemas/activity-unique-trait.schema';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import { ActivitiesService, ActivityNotFoundError } from './activities.service';
import { ActivityFiltersDto } from './dtos/activity-filters.dto';
import { ActivityWithEvidencesAndFeedbacksDto } from './dtos/activity-evidence-feedback.dto';
import { UserFromToken } from 'src/auth/user-from-token.decorator';
import { UserDto } from 'src/users/dtos/user.dto';
import { EvidenceFeedback } from 'src/evidence-feedback/schemas/evidence-feedback.schema';
import { EvidenceFeedbackDto } from 'src/evidence-feedback/dtos/evidence-feedback.dto';

@Controller('/activities/')
@ApiTags('Activities')
@LoggedInAs('superadmin', 'admin', 'unit')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  async create(
    @Body()
    creationDataDto: ActivityCreationDto,
  ): Promise<ActivityDto> {
    return await this.activitiesService.create(creationDataDto);
  }

  @Get('/:id/')
  async findOne(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
  ): Promise<ActivityWithEvidencesAndFeedbacksDto> {
    const activity = await this.activitiesService.findOne(
      activityUniqueTraitDto,
      ActivityFiltersDto.create({}),
    );

    if (!activity) {
      throw new NotFoundException(
        'Activity not found',
        `There is no activity with id ${activityUniqueTraitDto.id}`,
      );
    }

    return activity;
  }

  @Get()
  async findPage(
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
    @Query()
    filtersDto: ActivityFiltersDto,
  ): Promise<ActivitiesPageDto> {
    return await this.activitiesService.findPage(
      paginationOptionsDto,
      filtersDto,
    );
  }

  @Put('/:id/')
  async replace(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    @Body()
    replacementDataDto: ActivityReplacementDto,
    @UserFromToken()
    user: UserDto,
  ): Promise<ActivityDto> {
    if (user.role === 'unit') {
      const activity = await this.activitiesService.findOne(
        activityUniqueTraitDto,
        ActivityFiltersDto.create({}),
      );

      if (!activity) {
        throw new NotFoundException(
          'Activity not found',
          `There is no activity with ID ${activityUniqueTraitDto.id}`,
        );
      }

      if (activity.unitId !== user.id) {
        throw new ForbiddenException(
          `You are not allowed to update activities that are not yours`,
        );
      }
    }

    return await this.activitiesService.replace(
      activityUniqueTraitDto,
      replacementDataDto,
    );
  }

  @Delete('/:id/')
  async delete(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    @UserFromToken()
    user: UserDto,
  ): Promise<ActivityDto> {
    if (user.role === 'unit') {
      const activity = await this.activitiesService.findOne(
        activityUniqueTraitDto,
        ActivityFiltersDto.create({}),
      );

      if (!activity) {
        throw new NotFoundException(
          'Activity not found',
          `There is no activity with ID ${activityUniqueTraitDto.id}`,
        );
      }

      if (activity.unitId !== user.id) {
        throw new ForbiddenException(
          `You are not allowed to delete activities that are not yours`,
        );
      }
    }

    const deletedActivitySchema = await this.activitiesService.delete(
      ActivityUniqueTrait.parse(activityUniqueTraitDto),
      ActivityFiltersDto.create({}),
    );

    return ActivityDto.create(deletedActivitySchema);
  }

  @Delete('/:id/feedbacks')
  async deleteAllFeedbacks(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    @UserFromToken()
    user: UserDto,
  ): Promise<EvidenceFeedbackDto[]> {
    if (user.role === 'unit') {
      const activity = await this.activitiesService.findOne(
        activityUniqueTraitDto,
        ActivityFiltersDto.create({}),
      );

      if (!activity) {
        throw new NotFoundException(
          'Activity not found',
          `There is no activity with ID ${activityUniqueTraitDto.id}`,
        );
      }

      if (activity.unitId !== user.id) {
        throw new ForbiddenException(
          `You are not allowed to delete feeedbacks in activities that are not yours`,
        );
      }
    }

    const deletedFeedbacks = await this.activitiesService.deleteAllFeedbacks(
      ActivityUniqueTrait.parse(activityUniqueTraitDto),
    );

    return await Promise.all(
      deletedFeedbacks.map((feedback) =>
        EvidenceFeedbackDto.create(feedback),
      ),
    );
  }
}
