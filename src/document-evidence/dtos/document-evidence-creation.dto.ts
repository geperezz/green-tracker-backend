import { createZodDto, zodToOpenAPI } from 'nestjs-zod';

import { documentEvidenceDtoSchema } from './document-evidence.dto';

export const documentEvidenceCreationDtoSchema = documentEvidenceDtoSchema
  .omit({ link: true })
  .extend({
    evidenceNumber: documentEvidenceDtoSchema.shape.evidenceNumber.optional(),
  });

const rawDocumentEvidenceCreationDtoSwaggerSchema = zodToOpenAPI(
  documentEvidenceCreationDtoSchema,
);
export const documentEvidenceCreationDtoSwaggerSchema = {
  ...rawDocumentEvidenceCreationDtoSwaggerSchema,
  required: [
    ...rawDocumentEvidenceCreationDtoSwaggerSchema.required!,
    'documentFile',
  ],
  properties: {
    ...rawDocumentEvidenceCreationDtoSwaggerSchema.properties,
    documentFile: {
      type: 'string',
      format: 'binary',
    },
  },
};

export class DocumentEvidenceCreationDto extends createZodDto(
  documentEvidenceCreationDtoSchema,
) {}
