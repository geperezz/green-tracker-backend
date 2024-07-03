import { Module } from '@nestjs/common';
import { CriteriaRepository } from './criteria.repository';
import { CriteriaController } from './criteria.controller';
import { ActivitiesModule } from 'src/activities/activities.module';
import { UnitsModule } from 'src/units/units.module';
import { EvidenceModule } from 'src/evidence/evidence.module';
import { CriteriaService } from './criteria.service';

@Module({
  imports: [ActivitiesModule, UnitsModule, EvidenceModule],
  controllers: [CriteriaController],
  providers: [CriteriaRepository, CriteriaService],
  exports: [CriteriaRepository, CriteriaService],
})
export class CriteriaModule {}
