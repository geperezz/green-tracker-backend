import { z } from 'nestjs-zod/z';
import { evidenceFeedbackCreationSchema } from './evidence-feedback-creation.schema';

export const evidenceFeedbackReplacementSchema = evidenceFeedbackCreationSchema;

export const EvidenceFeedbackReplacement = evidenceFeedbackReplacementSchema.brand(
  'EvidenceFeedbackReplacement',
);
export type EvidenceFeedbackReplacement = z.infer<typeof EvidenceFeedbackReplacement>;
