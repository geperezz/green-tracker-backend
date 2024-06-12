import { z } from 'nestjs-zod/z';

import { recommendedCategorySchema } from './recommended-category.schema';

export const recommendedCategoryUniqueTraitSchema = recommendedCategorySchema;

export const RecommendedCategoryUniqueTrait =
  recommendedCategoryUniqueTraitSchema.brand('RecommendedCategoryUniqueTrait');
export type RecommendedCategoryUniqueTrait = z.infer<
  typeof RecommendedCategoryUniqueTrait
>;
