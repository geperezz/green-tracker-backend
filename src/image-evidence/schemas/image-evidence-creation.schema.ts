import { z } from 'nestjs-zod/z';

import { imageEvidenceSchema } from './image-evidence.schema';

export const imageEvidenceCreationSchema = imageEvidenceSchema;

export const ImageEvidenceCreation = imageEvidenceCreationSchema.brand(
  'ImageEvidenceCreation',
);
export type ImageEvidenceCreation = z.infer<typeof ImageEvidenceCreation>;
