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

@Controller('/activities/')
@ApiTags('Activities')
@LoggedInAs('superadmin', 'admin')
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
  ): Promise<ActivityDto> {
    const activity = await this.activitiesService.findOne(
      activityUniqueTraitDto,
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
  ): Promise<ActivityDto> {
    try {
      return await this.activitiesService.replace(
        activityUniqueTraitDto,
        replacementDataDto,
      );
    } catch (error) {
      if (error instanceof ActivityNotFoundError) {
        throw new NotFoundException('Activity not found', {
          description: `There is no activity with id ${activityUniqueTraitDto.id}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete('/:id/')
  async delete(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
  ): Promise<ActivityDto> {
    try {
      const deletedActivitySchema = await this.activitiesService.delete(
        ActivityUniqueTrait.parse(activityUniqueTraitDto),
      );

      return ActivityDto.create(deletedActivitySchema);
    } catch (error) {
      if (error instanceof ActivityNotFoundError) {
        throw new NotFoundException('Activity not found', {
          description: `There is no activity with id ${activityUniqueTraitDto.id}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
