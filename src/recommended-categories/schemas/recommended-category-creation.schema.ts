import { z } from 'nestjs-zod/z';

import { recommendedCategorySchema } from './recommended-category.schema';

export const recommendedCategoryCreationSchema = recommendedCategorySchema;

export const RecommendedCategoryCreation =
  recommendedCategoryCreationSchema.brand('RecommendedCategoryCreation');
export type RecommendedCategoryCreation = z.infer<
  typeof RecommendedCategoryCreation
>;
