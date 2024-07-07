import { createZodDto } from 'nestjs-zod';

import { evidenceSchema } from 'src/evidence/schemas/evidence.schema';

export const documentEvidenceDtoSchema = evidenceSchema.omit({
  activityId: true,
  type: true,
});

export class DocumentEvidenceDto extends createZodDto(
  documentEvidenceDtoSchema,
) {}
