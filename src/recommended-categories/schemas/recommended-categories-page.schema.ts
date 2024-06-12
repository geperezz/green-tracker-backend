import { z } from 'nestjs-zod/z';

import { buildPageSchema } from 'src/pagination/schemas/page.schema';
import { RecommendedCategory } from './recommended-category.schema';

export const recommendedCategoriesPageSchema =
  buildPageSchema(RecommendedCategory);

export const RecommendedCategoriesPage = recommendedCategoriesPageSchema.brand(
  'RecommendedCategoriesPage',
);
export type RecommendedCategoriesPage = z.infer<
  typeof recommendedCategoriesPageSchema
>;
