import { z } from 'nestjs-zod/z';

import { evidenceSchema } from '../schemas/evidence.schema';
import { imageEvidenceSchema } from 'src/image-evidence/schemas/image-evidence.schema';
import { evidenceFeedbackDtoSchema } from 'src/evidence-feedback/dtos/evidence-feedback.dto';

export const evidenceWithFeedbackDtoSchema = z.discriminatedUnion('type', [
  evidenceSchema
    .merge(imageEvidenceSchema)
    .extend({
      type: z.literal('image'),
      feedbacks: z.array(evidenceFeedbackDtoSchema),
    })
    .omit({ activityId: true }),
  evidenceSchema.omit({ activityId: true }).extend({
    type: z.enum(['document', 'link']),
    feedbacks: z.array(evidenceFeedbackDtoSchema),
  }),
]);

export const EvidenceWithFeedbackDto = evidenceWithFeedbackDtoSchema.brand(
  'EvidenceWithFeedbackDto',
);
export type EvidenceWithFeedbackDto = z.infer<typeof EvidenceWithFeedbackDto>;
