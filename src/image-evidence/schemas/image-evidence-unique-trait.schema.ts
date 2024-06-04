import { z } from 'nestjs-zod/z';

import { imageEvidenceSchema } from './image-evidence.schema';

export const ImageEvidenceUniqueTraitSchema = imageEvidenceSchema.pick({
  activityId: true,
  evidenceNumber: true,
});

export const ImageEvidenceUniqueTrait = ImageEvidenceUniqueTraitSchema.brand(
  'ImageEvidenceUniqueTrait',
);
export type ImageEvidenceUniqueTrait = z.infer<typeof ImageEvidenceUniqueTrait>;
