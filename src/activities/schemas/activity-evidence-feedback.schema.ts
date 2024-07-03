import { z } from 'nestjs-zod/z';

import { activitySchema } from './activity.schema';
import { evidenceWithFeedbackSchema } from 'src/evidence/schemas/evidence-with-feedback.schema';

export const activityWithEvidencesAndFeedbacksSchema = activitySchema.extend({
  evidences: z.array(evidenceWithFeedbackSchema),
});

export const ActivityWithEvidencesAndFeedbacks =
activityWithEvidencesAndFeedbacksSchema.brand('ActivityWithEvidencesAndFeedbacks');
export type ActivityWithEvidencesAndFeedbacks = z.infer<typeof ActivityWithEvidencesAndFeedbacks>;
