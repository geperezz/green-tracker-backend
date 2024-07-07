import { createZodDto } from 'nestjs-zod';

import { linkEvidenceDtoSchema } from './link-evidence.dto';

export const linkEvidenceCreationDtoSchema = linkEvidenceDtoSchema.extend({
  evidenceNumber: linkEvidenceDtoSchema.shape.evidenceNumber.optional(),
});

export class LinkEvidenceCreationDto extends createZodDto(
  linkEvidenceCreationDtoSchema,
) {}
