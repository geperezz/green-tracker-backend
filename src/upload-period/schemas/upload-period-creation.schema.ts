import { z } from 'nestjs-zod/z';

import { uploadPeriodSchema } from './upload-period.schema';

export const uploadPeriodCreationSchema = uploadPeriodSchema;

export const UploadPeriodCreation = uploadPeriodCreationSchema.brand(
  'UploadPeriodCreation',
);
export type UploadPeriodCreation = z.infer<typeof UploadPeriodCreation>;
