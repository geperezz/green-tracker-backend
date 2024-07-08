import { createZodDto } from 'nestjs-zod';

import {
  documentEvidenceCreationDtoSchema,
  documentEvidenceCreationDtoSwaggerSchema,
} from './document-evidence-creation.dto';

export const documentEvidenceReplacementDtoSchema =
  documentEvidenceCreationDtoSchema;

export const documentEvidenceReplacementDtoSwaggerSchema =
  documentEvidenceCreationDtoSwaggerSchema;

export class DocumentEvidenceReplacementDto extends createZodDto(
  documentEvidenceReplacementDtoSchema,
) {}
