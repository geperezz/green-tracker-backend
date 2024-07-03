import { createZodDto } from 'nestjs-zod';
import { evidenceFeedbackReplacementDtoSchema } from './evidence-feedback-replacement.dto';

export const adminEvidenceFeedbackReplacementDtoSchema =
  evidenceFeedbackReplacementDtoSchema.omit({ adminId: true });

export class AdminEvidenceFeedbackReplacementDtoSchema extends createZodDto(
  adminEvidenceFeedbackReplacementDtoSchema,
) {}
