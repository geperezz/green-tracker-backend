import { createZodDto } from 'nestjs-zod';

import { evidenceSchema } from 'src/evidence/schemas/evidence.schema';

export const linkEvidenceDtoSchema = evidenceSchema.omit({
  activityId: true,
  type: true,
});

export class LinkEvidenceDto extends createZodDto(linkEvidenceDtoSchema) {}
