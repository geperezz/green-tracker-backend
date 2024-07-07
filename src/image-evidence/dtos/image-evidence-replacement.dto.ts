import { createZodDto } from 'nestjs-zod';

import {
  imageEvidenceCreationDtoSchema,
  imageEvidenceCreationDtoSwaggerSchema,
} from './image-evidence-creation.dto';

export const imageEvidenceReplacementDtoSchema = imageEvidenceCreationDtoSchema;

export const imageEvidenceReplacementDtoSwaggerSchema =
  imageEvidenceCreationDtoSwaggerSchema;

export class ImageEvidenceReplacementDto extends createZodDto(
  imageEvidenceReplacementDtoSchema,
) {}
