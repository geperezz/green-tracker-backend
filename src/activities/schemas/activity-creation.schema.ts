import { z } from 'nestjs-zod/z';

import { activitySchema } from './activity.schema';

export const activityCreationSchema = activitySchema.extend({
  id: activitySchema.shape.id.optional(),
});

export const ActivityCreation =
  activityCreationSchema.brand('ActivityCreation');
export type ActivityCreation = z.infer<typeof ActivityCreation>;
