import { Module, forwardRef } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

export const API_PATH_TO_EVIDENCE_FILES = '/evidence-files/';
export const FS_PATH_TO_EVIDENCE_FILES = path.resolve(
  __dirname,
  '..',
  '..',
  'evidence-files',
);

import { EvidenceRepository } from './evidence.repository';
import { ImageEvidenceModule } from 'src/image-evidence/image-evidence.module';
import { EvidenceService } from './evidence.service';

@Module({
  imports: [
    forwardRef(() => ImageEvidenceModule),
    ServeStaticModule.forRoot({
      rootPath: FS_PATH_TO_EVIDENCE_FILES,
      serveRoot: API_PATH_TO_EVIDENCE_FILES,
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  providers: [EvidenceRepository, EvidenceService],
  exports: [EvidenceRepository, EvidenceService],
})
export class EvidenceModule {}
