import { Module } from '@nestjs/common';

import { UnitsEvidenceController } from './units-evidence.controller';
import { EvidenceModule } from 'src/evidence/evidence.module';

@Module({
  imports: [EvidenceModule],
  controllers: [UnitsEvidenceController],
})
export class UnitsEvidenceModule {}
