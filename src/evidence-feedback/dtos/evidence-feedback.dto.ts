import { createZodDto } from 'nestjs-zod';
import { evidenceFeedbackSchema } from '../schemas/evidence-feedback.schema';


export const evidenceFeedbackDtoSchema = evidenceFeedbackSchema;

export class EvidenceFeedbackDto extends createZodDto(evidenceFeedbackDtoSchema) {}
