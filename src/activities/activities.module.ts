import { Module } from '@nestjs/common';

import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivitiesRepository } from './activities.repository';
import { EvidenceModule } from 'src/evidence/evidence.module';

@Module({
  imports: [EvidenceModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivitiesRepository],
  exports: [ActivitiesRepository],
})
export class ActivitiesModule {}
