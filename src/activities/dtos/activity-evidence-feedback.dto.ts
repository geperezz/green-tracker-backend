import { createZodDto } from 'nestjs-zod';
import { activityWithEvidencesAndFeedbacksSchema } from '../schemas/activity-evidence-feedback.schema';
import { z } from 'nestjs-zod/z';
import { evidenceWithFeedbackDtoSchema } from 'src/evidence/dtos/evidence-with-feedback.dto';

export const activityWithEvidencesAndFeedbacksDto =
  activityWithEvidencesAndFeedbacksSchema.extend({
    evidences: z.array(evidenceWithFeedbackDtoSchema).optional(),
  });

export class ActivityWithEvidencesAndFeedbacksDto extends createZodDto(
  activityWithEvidencesAndFeedbacksDto,
) {}
