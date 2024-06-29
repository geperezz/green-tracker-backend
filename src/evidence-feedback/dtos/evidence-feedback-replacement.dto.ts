import { createZodDto } from 'nestjs-zod';
import { evidenceFeedbackDtoSchema } from './evidence-feedback.dto';

export const evidenceFeedbackReplacementDtoSchema = evidenceFeedbackDtoSchema;

export class EvidenceFeedbackReplacementDto extends createZodDto(
  evidenceFeedbackReplacementDtoSchema,
) {}
