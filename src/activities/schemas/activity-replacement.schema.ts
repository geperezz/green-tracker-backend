import { z } from 'nestjs-zod/z';

import { activityCreationSchema } from './activity-creation.schema';

export const activityReplacementSchema = activityCreationSchema;

export const ActivityReplacement = activityReplacementSchema.brand(
  'ActivityReplacement',
);
export type ActivityReplacement = z.infer<typeof ActivityReplacement>;
