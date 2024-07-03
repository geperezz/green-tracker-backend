import { z } from 'nestjs-zod/z';
import { evidenceFeedbackSchema } from './evidence-feedback.schema';

export const evidenceFeedbackTraitSchema = evidenceFeedbackSchema.pick({
  activityId: true,
  evidenceNumber: true,
  feedback: true,
});

export const EvidenceFeedbackUniqueTrait = evidenceFeedbackTraitSchema.brand(
  'EvidenceFeedbackUniqueTrait',
);
export type EvidenceFeedbackUniqueTrait = z.infer<typeof EvidenceFeedbackUniqueTrait>;
