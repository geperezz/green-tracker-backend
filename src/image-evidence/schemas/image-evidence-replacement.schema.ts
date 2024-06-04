import { z } from 'nestjs-zod/z';

import { imageEvidenceCreationSchema } from './image-evidence-creation.schema';

export const ImageEvidenceReplacementSchema = imageEvidenceCreationSchema;

export const ImageEvidenceReplacement = ImageEvidenceReplacementSchema.brand(
  'ImageEvidenceReplacement',
);
export type ImageEvidenceReplacement = z.infer<typeof ImageEvidenceReplacement>;
