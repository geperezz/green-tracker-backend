import { z } from 'nestjs-zod/z';

import { indicatorSchema } from './indicator.schema';

export const indicatorCreationSchema = indicatorSchema;

export const IndicatorCreation =
  indicatorCreationSchema.brand('IndicatorCreation');
export type IndicatorCreation = z.infer<typeof IndicatorCreation>;
