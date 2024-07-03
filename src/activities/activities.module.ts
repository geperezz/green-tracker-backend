import { Module, forwardRef } from '@nestjs/common';

import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivitiesRepository } from './activities.repository';
import { EvidenceModule } from 'src/evidence/evidence.module';
import { UnitsModule } from 'src/units/units.module';
import { UploadPeriodModule } from 'src/upload-period/upload-period.module';
import { EvidenceFeedbackModule } from 'src/evidence-feedback/evidence-feedback.module';

@Module({
  imports: [
    EvidenceFeedbackModule,
    EvidenceModule,
    forwardRef(() => UnitsModule),
    forwardRef(() => UploadPeriodModule),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivitiesRepository],
  exports: [ActivitiesService, ActivitiesRepository],
})
export class ActivitiesModule {}
