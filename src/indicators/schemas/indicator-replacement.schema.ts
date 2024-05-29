import { z } from 'nestjs-zod/z';

import { indicatorCreationSchema } from './indicator-creation.schema';

export const indicatorReplacementSchema = indicatorCreationSchema;

export const IndicatorReplacement = indicatorReplacementSchema.brand(
  'IndicatorReplacement',
);
export type IndicatorReplacement = z.infer<typeof IndicatorReplacement>;
