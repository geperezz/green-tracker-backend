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
  ActivityNotFoundError,
  ActivitiesRepository,
} from './activities.repository';
import { ActivityCreationDto } from './dtos/activity-creation.dto';
import { ActivityDto } from './dtos/activity.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { ActivitiesPageDto } from './dtos/activities-page.dto';
import { ActivityReplacementDto } from './dtos/activity-replacement.dto';
import { ActivityUniqueTraitDto } from './dtos/activity-unique-trait.dto';
import { ActivityCreation } from './schemas/activity-creation.schema';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { ActivityUniqueTrait } from './schemas/activity-unique-trait.schema';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import { ActivityReplacement } from './schemas/activity-replacement.schema';

@Controller('/activities/')
@ApiTags('Activities')
@LoggedInAs('superadmin', 'admin')
export class ActivitiesController {
  constructor(private readonly activitiesRepository: ActivitiesRepository) {}

  @Post()
  async create(
    @Body()
    creationDataDto: ActivityCreationDto,
  ): Promise<ActivityDto> {
    const createdActivitySchema = await this.activitiesRepository.create(
      ActivityCreation.parse(creationDataDto),
    );
    return ActivityDto.fromSchema(createdActivitySchema);
  }

  @Get('/:id/')
  @LoggedInAs('unit')
  async findOne(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
  ): Promise<ActivityDto> {
    console.log(activityUniqueTraitDto)
    const activitySchema = await this.activitiesRepository.findOne(
      ActivityUniqueTrait.parse(activityUniqueTraitDto),
    );

    if (!activitySchema) {
      throw new NotFoundException(
        'Activity not found',
        `There is no activity with id ${activityUniqueTraitDto.id}`,
      );
    }

    return ActivityDto.fromSchema(activitySchema);
  }

  @Get()
  @LoggedInAs('unit')
  async findPage(
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<ActivitiesPageDto> {
    const activitySchemasPage = await this.activitiesRepository.findPage(
      PaginationOptions.parse(paginationOptionsDto),
    );

    const activityDtosPage = {
      ...activitySchemasPage,
      items: activitySchemasPage.items.map((activitySchema) =>
        ActivityDto.fromSchema(activitySchema),
      ),
    };

    return activityDtosPage;
  }

  @Put('/:id/')
  async replace(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    @Body()
    replacementDataDto: ActivityReplacementDto,
  ): Promise<ActivityDto> {
    try {
      const newActivitySchema = await this.activitiesRepository.replace(
        ActivityUniqueTrait.parse(activityUniqueTraitDto),
        ActivityReplacement.parse(replacementDataDto),
      );

      return ActivityDto.fromSchema(newActivitySchema);
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
      const deletedActivitySchema = await this.activitiesRepository.delete(
        ActivityUniqueTrait.parse(activityUniqueTraitDto),
      );

      return ActivityDto.fromSchema(deletedActivitySchema);
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
