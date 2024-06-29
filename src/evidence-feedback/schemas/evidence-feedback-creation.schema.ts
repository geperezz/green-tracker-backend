import { z } from 'nestjs-zod/z';
import { evidenceFeedbackSchema } from './evidence-feedback.schema';


export const evidenceFeedbackCreationSchema = evidenceFeedbackSchema;

export const EvidenceFeedbackCreation =
evidenceFeedbackCreationSchema.brand('EvidenceFeedbackCreation');
export type EvidenceFeedbackCreation = z.infer<typeof EvidenceFeedbackCreation>;
