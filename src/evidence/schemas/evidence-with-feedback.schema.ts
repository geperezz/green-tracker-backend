import { z } from 'nestjs-zod/z';
import { evidenceSchema } from './evidence.schema';
import { evidenceFeedbackSchema } from 'src/evidence-feedback/schemas/evidence-feedback.schema';

export const evidenceWithFeedbackSchema = evidenceSchema
  .omit({ activityId: true })
  .extend({
    feedbacks: z
      .array(
        evidenceFeedbackSchema.omit({ activityId: true, evidenceNumber: true }),
      )
      .optional(),
  });

export const EvidenceWithFeedback = evidenceWithFeedbackSchema.brand(
  'EvidenceWithFeedback',
);
export type EvidenceWithFeedback = z.infer<typeof EvidenceWithFeedback>;
