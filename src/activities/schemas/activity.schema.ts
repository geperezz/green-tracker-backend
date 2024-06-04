import { z } from 'nestjs-zod/z';

export const activitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  indicatorIndex: z.coerce.number().int().min(0),
  categoryName: z.string().trim().min(1),
  unitId: z.string().uuid(),
  uploadTimestamp: z.coerce.date(),
});

export const Activity = activitySchema.brand('Activity');
export type Activity = z.infer<typeof Activity>;
