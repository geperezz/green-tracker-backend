import { Module } from '@nestjs/common';

import { ActivitiesRepository } from './activities.repository';
import { ActivitiesController } from './activities.controller';

@Module({
  providers: [ActivitiesRepository],
  exports: [ActivitiesRepository],
  controllers: [ActivitiesController],
})
export class ActivitiesModule {}
