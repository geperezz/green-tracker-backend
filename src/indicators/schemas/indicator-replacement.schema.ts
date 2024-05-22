import { z } from 'nestjs-zod/z';

import { indicatorCreationSchema } from './indicator-creation.schema';

export const indicatorReplacementSchema = indicatorCreationSchema;

export type IndicatorReplacement = z.infer<typeof indicatorReplacementSchema>;
