import { z } from 'nestjs-zod/z';
import { activitySchema } from './activity.schema';

export const activityUniqueTraitSchema = activitySchema.pick({ id: true });

export const ActivityUniqueTrait = activityUniqueTraitSchema.brand(
  'ActivityUniqueTrait',
);
export type ActivityUniqueTrait = z.infer<typeof ActivityUniqueTrait>;
