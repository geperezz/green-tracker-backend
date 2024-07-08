import { Module, forwardRef } from '@nestjs/common';

import { LinkEvidenceController } from './link-evidence.controller';
import { EvidenceModule } from 'src/evidence/evidence.module';
import { LinkEvidenceService } from './link-evidence.service';
import { ActivitiesModule } from 'src/activities/activities.module';

@Module({
  imports: [
    forwardRef(() => EvidenceModule),
    forwardRef(() => ActivitiesModule),
  ],
  controllers: [LinkEvidenceController],
  providers: [LinkEvidenceService],
  exports: [LinkEvidenceService],
})
export class LinkEvidenceModule {}
