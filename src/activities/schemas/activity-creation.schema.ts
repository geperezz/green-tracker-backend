import { z } from 'nestjs-zod/z';

import { activitySchema } from './activity.schema';

export const activityCreationSchema = activitySchema;

export const ActivityCreation =
  activityCreationSchema.brand('ActivityCreation');
export type ActivityCreation = z.infer<typeof ActivityCreation>;
