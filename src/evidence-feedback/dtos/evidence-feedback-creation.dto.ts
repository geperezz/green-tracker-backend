import { createZodDto } from 'nestjs-zod';
import { evidenceFeedbackDtoSchema } from './evidence-feedback.dto';

export const evidenceFeedbackCreationDtoSchema = evidenceFeedbackDtoSchema.omit(
  { activityId: true, evidenceNumber: true },
);

export class EvidenceFeedbackCreationDto extends createZodDto(
  evidenceFeedbackCreationDtoSchema,
) {}
