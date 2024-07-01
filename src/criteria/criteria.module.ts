import { Module } from '@nestjs/common';
import { CriteriaRepository } from './criteria.repository';
import { CriteriaController } from './criteria.controller';
import { ActivitiesModule } from 'src/activities/activities.module';
import { UnitsModule } from 'src/units/units.module';

@Module({
  imports: [ActivitiesModule, UnitsModule],
  controllers: [CriteriaController],
  providers: [CriteriaRepository],
  exports: [CriteriaRepository],
})
export class CriteriaModule {}
