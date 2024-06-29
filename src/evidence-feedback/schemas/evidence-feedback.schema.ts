import { z } from 'nestjs-zod/z';
import { feedbackType } from '../evidence-feedback.table';
import { evidenceSchema } from 'src/evidence/schemas/evidence.schema';

export const evidenceFeedbackSchema = z.object({
  activityId: evidenceSchema.shape.activityId,
  evidenceNumber: evidenceSchema.shape.evidenceNumber,
  adminId: z.string().uuid(),
  feedback: z.enum(feedbackType.enumValues),
});

export const EvidenceFeedback = evidenceFeedbackSchema.brand('EvidenceFeedback');
export type EvidenceFeedback = z.infer<typeof EvidenceFeedback>;
