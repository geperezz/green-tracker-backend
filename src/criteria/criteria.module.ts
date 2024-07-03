import { Module } from '@nestjs/common';
import { CriteriaRepository } from './criteria.repository';
import { CriteriaController } from './criteria.controller';
import { ActivitiesModule } from 'src/activities/activities.module';
import { UnitsModule } from 'src/units/units.module';
import { EvidenceModule } from 'src/evidence/evidence.module';

@Module({
  imports: [ActivitiesModule, UnitsModule, EvidenceModule],
  controllers: [CriteriaController],
  providers: [CriteriaRepository],
  exports: [CriteriaRepository],
})
export class CriteriaModule {}
