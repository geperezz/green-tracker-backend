import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as randomUuid } from 'uuid';
import * as path from 'path';

import { ImageEvidenceRepository } from './image-evidence.repository';
import { ImageEvidenceController } from './image-evidence.controller';
import {
  EvidenceModule,
  FS_PATH_TO_EVIDENCE_FILES,
} from 'src/evidence/evidence.module';
import { ImageEvidenceService } from './image-evidence.service';
import { ActivitiesModule } from 'src/activities/activities.module';

@Module({
  imports: [
    forwardRef(() => EvidenceModule),
    forwardRef(() => ActivitiesModule),
    MulterModule.register({
      storage: diskStorage({
        destination: FS_PATH_TO_EVIDENCE_FILES,
        filename: (request, file, callback) => {
          callback(null, `${randomUuid()}${path.extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [ImageEvidenceController],
  providers: [ImageEvidenceRepository, ImageEvidenceService],
  exports: [ImageEvidenceRepository, ImageEvidenceService],
})
export class ImageEvidenceModule {}
