import { createZodDto } from 'nestjs-zod';
import { evidenceFeedbackCreationDtoSchema } from './evidence-feedback-creation.dto';

export const adminEvidenceFeedbackCreationDtoSchema = evidenceFeedbackCreationDtoSchema.omit(
  { adminId: true },
);

export class AdminEvidenceFeedbackCreationDtoSchema extends createZodDto(
  adminEvidenceFeedbackCreationDtoSchema,
) {}
