import { Module } from '@nestjs/common';

import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivitiesRepository } from './activities.repository';
import { EvidenceModule } from 'src/evidence/evidence.module';
import { UnitsModule } from 'src/units/units.module';
import { UploadPeriodModule } from 'src/upload-period/upload-period.module';

@Module({
  imports: [EvidenceModule, UnitsModule, UploadPeriodModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivitiesRepository],
  exports: [ActivitiesRepository],
})
export class ActivitiesModule {}
