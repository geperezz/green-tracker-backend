import { Module } from '@nestjs/common';

import { EvidenceRepository } from './evidence.repository';
import { EvidenceService } from './evidence.service';
import { EvidenceController } from './evidence.controller';
import { ImageEvidenceModule } from 'src/image-evidence/image-evidence.module';

@Module({
  imports: [ImageEvidenceModule],
  controllers: [EvidenceController],
  providers: [EvidenceService, EvidenceRepository],
  exports: [EvidenceService, EvidenceRepository],
})
export class EvidenceModule {}
