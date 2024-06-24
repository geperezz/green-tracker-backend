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

import { UnitActivityCreationDto } from './dtos/unit-activity-creation.dto';
import { UnitActivityDto } from './dtos/unit-activity.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { UnitActivitiesPageDto } from './dtos/unit-activities-page.dto';
import { UnitActivityReplacementDto } from './dtos/unit-activity-replacement.dto';
import { UnitActivityUniqueTraitDto } from './dtos/unit-activity-unique-trait.dto';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import {
  ActivitiesService,
  ActivityNotFoundError,
} from 'src/activities/activities.service';
import { UnitActivityFiltersDto } from './dtos/unit-activity-filters.dto';
import { ActivityCreationDto } from 'src/activities/dtos/activity-creation.dto';
import { UserFromToken } from 'src/auth/user-from-token.decorator';
import { UserDto } from 'src/users/dtos/user.dto';
import { ActivityUniqueTraitDto } from 'src/activities/dtos/activity-unique-trait.dto';
import { ActivityFiltersDto } from 'src/activities/dtos/activity-filters.dto';
import { ActivityReplacementDto } from 'src/activities/dtos/activity-replacement.dto';

@Controller('/units/me/activities/')
@ApiTags('Activities of logged in units')
@LoggedInAs('unit')
export class UnitsActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  async createMyActivity(
    @Body()
    creationDataDto: UnitActivityCreationDto,
    @UserFromToken()
    me: UserDto,
  ): Promise<UnitActivityDto> {
    return await this.activitiesService.create(
      ActivityCreationDto.create({ ...creationDataDto, unitId: me.id }),
    );
  }

  @Get('/:activityId/')
  async findMyActivity(
    @Param()
    uniqueTraitDto: UnitActivityUniqueTraitDto,
    @UserFromToken()
    me: UserDto,
  ): Promise<UnitActivityDto> {
    const activity = await this.activitiesService.findOne(
      ActivityUniqueTraitDto.create({ id: uniqueTraitDto.activityId }),
      ActivityFiltersDto.create({ unitId: me.id }),
    );

    if (!activity) {
      throw new NotFoundException(
        'Activity not found',
        `There is no activity with id ${uniqueTraitDto.activityId} done by the unit with id ${me.id}`,
      );
    }

    return activity;
  }

  @Get()
  async findMyActivitiesPage(
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
    @Query()
    filtersDto: UnitActivityFiltersDto,
    @UserFromToken()
    me: UserDto,
  ): Promise<UnitActivitiesPageDto> {
    return await this.activitiesService.findPage(
      paginationOptionsDto,
      ActivityFiltersDto.create({ ...filtersDto, unitId: me.id }),
    );
  }

  @Put('/:activityId/')
  async replaceMyActivity(
    @Param()
    uniqueTraitDto: UnitActivityUniqueTraitDto,
    @Body()
    replacementDataDto: UnitActivityReplacementDto,
    @UserFromToken()
    me: UserDto,
  ): Promise<UnitActivityDto> {
    try {
      return await this.activitiesService.replace(
        ActivityUniqueTraitDto.create({ id: uniqueTraitDto.activityId }),
        ActivityReplacementDto.create({ ...replacementDataDto, unitId: me.id }),
      );
    } catch (error) {
      if (error instanceof ActivityNotFoundError) {
        throw new NotFoundException('Activity not found', {
          description: `There is no activity with id ${uniqueTraitDto.activityId} done by the unit with id ${me.id}`,
          cause: error,
        });
      }

      throw error;
    }
  }

  @Delete('/:activityId/')
  async deleteMyActivity(
    @Param()
    uniqueTraitDto: UnitActivityUniqueTraitDto,
    @UserFromToken()
    me: UserDto,
  ): Promise<UnitActivityDto> {
    try {
      const deletedActivitySchema = await this.activitiesService.delete(
        ActivityUniqueTraitDto.create({ id: uniqueTraitDto.activityId }),
        ActivityFiltersDto.create({ unitId: me.id }),
      );

      return UnitActivityDto.create(deletedActivitySchema);
    } catch (error) {
      if (error instanceof ActivityNotFoundError) {
        throw new NotFoundException('Activity not found', {
          description: `There is no activity with id ${uniqueTraitDto.activityId} done by the unit with id ${me.id}`,
          cause: error,
        });
      }

      throw error;
    }
  }
}
