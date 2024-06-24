import { Module } from '@nestjs/common';

import { UnitsActivitiesController } from './units-activities.controller';
import { ActivitiesModule } from 'src/activities/activities.module';

@Module({
  imports: [ActivitiesModule],
  controllers: [UnitsActivitiesController],
})
export class UnitsActivitiesModule {}
