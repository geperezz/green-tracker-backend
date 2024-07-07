import { createZodDto, zodToOpenAPI } from 'nestjs-zod';

import { imageEvidenceDtoSchema } from './image-evidence.dto';

export const imageEvidenceCreationDtoSchema = imageEvidenceDtoSchema
  .omit({ link: true })
  .extend({
    evidenceNumber: imageEvidenceDtoSchema.shape.evidenceNumber.optional(),
  });

const rawImageEvidenceCreationDtoSwaggerSchema = zodToOpenAPI(
  imageEvidenceCreationDtoSchema,
);
export const imageEvidenceCreationDtoSwaggerSchema = {
  ...rawImageEvidenceCreationDtoSwaggerSchema,
  required: [
    ...rawImageEvidenceCreationDtoSwaggerSchema.required!,
    'imageFile',
  ],
  properties: {
    ...rawImageEvidenceCreationDtoSwaggerSchema.properties,
    imageFile: {
      type: 'string',
      format: 'binary',
    },
  },
};

export class ImageEvidenceCreationDto extends createZodDto(
  imageEvidenceCreationDtoSchema,
) {}
