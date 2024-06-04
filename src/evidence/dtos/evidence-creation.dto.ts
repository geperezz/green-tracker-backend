import { z } from 'nestjs-zod/z';

import { evidenceSchema } from '../schemas/evidence.schema';
import { imageEvidenceSchema } from 'src/image-evidence/schemas/image-evidence.schema';

export const evidenceCreationDtoSchema = z.discriminatedUnion('type', [
  evidenceSchema
    .extend({
      type: z.literal('image'),
    })
    .merge(imageEvidenceSchema)
    .omit({ activityId: true })
    .extend({
      evidenceNumber: evidenceSchema.shape.evidenceNumber.optional(),
    }),
  evidenceSchema.omit({ activityId: true }).extend({
    type: z.enum(['document', 'link']),
    evidenceNumber: evidenceSchema.shape.evidenceNumber.optional(),
  }),
]);

export const EvidenceCreationDto = evidenceCreationDtoSchema.brand(
  'EvidenceCreationDto',
);
export type EvidenceCreationDto = z.infer<typeof EvidenceCreationDto>;
