import { z } from 'nestjs-zod/z';
import { categorySchema } from './category.schema';

export const categoryIndicatorIndexSchema = categorySchema.pick({
  indicatorIndex: true,
});

export const CategoryIndicatorIndex = categoryIndicatorIndexSchema.brand(
  'CategoryIndicatorIndex',
);
export type CategoryIndicatorIndex = z.infer<typeof CategoryIndicatorIndex>;