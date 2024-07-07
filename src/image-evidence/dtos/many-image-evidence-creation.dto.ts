import { z } from 'nestjs-zod/z';
import { imageEvidenceCreationDtoSchema } from './image-evidence-creation.dto';
import { createZodDto } from 'nestjs-zod';

export const manyImageEvidenceCreationDtoSchema = z
  .array(
    imageEvidenceCreationDtoSchema.extend({
      imageFile: z.string(),
    }),
  )
  .min(1);

export class ManyImageEvidenceCreationDto extends createZodDto(
  manyImageEvidenceCreationDtoSchema,
) {}
