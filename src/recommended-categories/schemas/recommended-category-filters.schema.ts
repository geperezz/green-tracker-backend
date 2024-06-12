import { z } from 'nestjs-zod/z';

import { recommendedCategorySchema } from './recommended-category.schema';

export const recommendedCategoryFiltersSchema =
  recommendedCategorySchema.partial();

export const RecommendedCategoryFilters =
  recommendedCategoryFiltersSchema.brand('RecommendedCategoryFilters');
export type RecommendedCategoryFilters = z.infer<
  typeof RecommendedCategoryFilters
>;
