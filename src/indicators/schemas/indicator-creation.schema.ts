import { z } from 'nestjs-zod/z';

import { indicatorSchema } from './indicator.schema';

export const indicatorCreationSchema = indicatorSchema;

export type IndicatorCreation = z.infer<typeof indicatorSchema>;
