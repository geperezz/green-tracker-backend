import { z } from 'nestjs-zod/z';

import { activitySchema } from './activity.schema';

export const activityFiltersSchema = activitySchema.partial();

export const ActivityFilters = activityFiltersSchema.brand('ActivityFilters');
export type ActivityFilters = z.infer<typeof ActivityFilters>;
