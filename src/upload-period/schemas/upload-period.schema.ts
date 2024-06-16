import { z } from 'nestjs-zod/z';

export const uploadPeriodSchema = z.object({
  id: z.string().uuid(),
  startTimestamp: z.coerce.date(),
  endTimestamp: z.coerce.date(),
});

export const UploadPeriod = uploadPeriodSchema.brand('Indicator');
export type UploadPeriod = z.infer<typeof UploadPeriod>;
