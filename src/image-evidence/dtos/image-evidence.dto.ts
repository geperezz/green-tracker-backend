import { createZodDto } from 'nestjs-zod';

import { evidenceSchema } from 'src/evidence/schemas/evidence.schema';
import { imageEvidenceSchema } from 'src/image-evidence/schemas/image-evidence.schema';

export const imageEvidenceDtoSchema = evidenceSchema
  .merge(imageEvidenceSchema)
  .omit({ activityId: true, type: true });

export class ImageEvidenceDto extends createZodDto(imageEvidenceDtoSchema) {}
