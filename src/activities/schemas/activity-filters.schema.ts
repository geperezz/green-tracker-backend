import { z } from 'nestjs-zod/z';

import { activitySchema } from './activity.schema';

export const activityFiltersSchema = activitySchema
  .extend({
    uploadTimestamp: activitySchema.shape.uploadTimestamp.or(
      z
        .object({
          eq: activitySchema.shape.uploadTimestamp.optional(),
          gte: activitySchema.shape.uploadTimestamp.optional(),
          lte: activitySchema.shape.uploadTimestamp.optional(),
        })
        .refine(
          (filters) => filters.gte !== undefined || filters.lte !== undefined,
          { message: 'At least one filter must be specified' },
        )
        .transform((filters) => ({
          ...filters,
          isUsingExtendedFilters: true as const,
        })),
    ),
  })
  .partial();

export const ActivityFilters = activityFiltersSchema.brand('ActivityFilters');
export type ActivityFilters = z.infer<typeof ActivityFilters>;
