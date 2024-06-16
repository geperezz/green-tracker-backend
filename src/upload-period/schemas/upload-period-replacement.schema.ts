import { z } from 'nestjs-zod/z';
import { uploadPeriodSchema } from './upload-period.schema';

export const uploadPeriodReplacementSchema = uploadPeriodSchema.extend({
  id: uploadPeriodSchema.shape.id.optional(),
});;

export const uploadPeriodReplacement = uploadPeriodReplacementSchema.brand(
  'uploadPeriodReplacement',
);
export type uploadPeriodReplacement = z.infer<typeof uploadPeriodReplacement>;
