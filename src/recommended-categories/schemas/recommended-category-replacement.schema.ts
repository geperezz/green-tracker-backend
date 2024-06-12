import { z } from 'nestjs-zod/z';

import { recommendedCategoryCreationSchema } from './recommended-category-creation.schema';

export const recommendedCategoryReplacementSchema =
  recommendedCategoryCreationSchema;

export const RecommendedCategoryReplacement =
  recommendedCategoryReplacementSchema.brand('RecommendedCategoryReplacement');
export type RecommendedCategoryReplacement = z.infer<
  typeof RecommendedCategoryReplacement
>;
