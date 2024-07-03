import { createZodDto } from 'nestjs-zod';
import { activityWithEvidencesAndFeedbacksSchema } from '../schemas/activity-evidence-feedback.schema';

export const activityWithEvidencesAndFeedbacksDto = activityWithEvidencesAndFeedbacksSchema;

export class ActivityWithEvidencesAndFeedbacksDto extends createZodDto(activityWithEvidencesAndFeedbacksDto) {}
