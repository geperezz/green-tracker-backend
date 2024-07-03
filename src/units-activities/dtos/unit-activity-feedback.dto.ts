import { createZodDto } from 'nestjs-zod';

import { activityWithEvidencesAndFeedbacksSchema } from 'src/activities/schemas/activity-evidence-feedback.schema';

export const unitActivityWithFeedbackDtoSchema = activityWithEvidencesAndFeedbacksSchema.omit({ unitId: true });

export class UnitActivityWithFeedbackDto extends createZodDto(unitActivityWithFeedbackDtoSchema) {}
