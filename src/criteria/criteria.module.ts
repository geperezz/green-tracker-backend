import { Module } from '@nestjs/common';
import { CriteriaRepository } from './criteria.repository';
import { CriteriaController } from './criteria.controller';
import { ActivitiesModule } from 'src/activities/activities.module';

@Module({
  imports: [ActivitiesModule],
  controllers: [CriteriaController],
  providers: [CriteriaRepository],
  exports: [CriteriaRepository],
})
export class CriteriaModule {}
