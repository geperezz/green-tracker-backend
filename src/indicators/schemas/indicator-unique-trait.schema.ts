import { z } from 'nestjs-zod/z';
import { indicatorSchema } from './indicator.schema';

export const indicatorUniqueTraitSchema = indicatorSchema.pick({ index: true });

export const IndicatorUniqueTrait = indicatorUniqueTraitSchema.brand(
  'IndicatorUniqueTrait',
);
export type IndicatorUniqueTrait = z.infer<typeof IndicatorUniqueTrait>;
