import { Module } from '@nestjs/common';

import { ImageEvidenceRepository } from './image-evidence.repository';

@Module({
  providers: [ImageEvidenceRepository],
  exports: [ImageEvidenceRepository],
})
export class ImageEvidenceModule {}
