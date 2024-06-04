import { z } from 'nestjs-zod/z';

import { evidenceSchema } from '../schemas/evidence.schema';
import { imageEvidenceSchema } from 'src/image-evidence/schemas/image-evidence.schema';

export const evidenceDtoSchema = z.discriminatedUnion('type', [
  evidenceSchema
    .extend({
      type: z.literal('image'),
    })
    .merge(imageEvidenceSchema)
    .omit({ activityId: true }),
  evidenceSchema
    .omit({ activityId: true })
    .extend({ type: z.enum(['document', 'link']) }),
]);

export const EvidenceDto = evidenceDtoSchema.brand('EvidenceDto');
export type EvidenceDto = z.infer<typeof EvidenceDto>;
