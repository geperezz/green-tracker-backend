import { createZodDto } from 'nestjs-zod';

import { linkEvidenceCreationDtoSchema } from './link-evidence-creation.dto';

export const linkEvidenceReplacementDtoSchema = linkEvidenceCreationDtoSchema;

export class LinkEvidenceReplacementDto extends createZodDto(
  linkEvidenceReplacementDtoSchema,
) {}
