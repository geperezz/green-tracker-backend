import { z } from 'nestjs-zod/z';

import { evidenceSchema } from 'src/evidence/schemas/evidence.schema';

export const imageEvidenceSchema = z.object({
  activityId: evidenceSchema.shape.activityId,
  evidenceNumber: evidenceSchema.shape.evidenceNumber,
  linkToRelatedResource: z.string().trim().min(0).nullable().default(null),
});

export const ImageEvidence = imageEvidenceSchema.brand('ImageEvidence');
export type ImageEvidence = z.infer<typeof ImageEvidence>;
