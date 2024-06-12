import { z } from 'nestjs-zod/z';

import { categorySchema } from 'src/categories/schemas/category.schema';
import { userSchema } from 'src/users/schemas/user.schema';

export const recommendedCategorySchema = z.object({
  indicatorIndex: categorySchema.shape.indicatorIndex,
  categoryName: categorySchema.shape.name,
  unitId: userSchema.shape.id,
});

export const RecommendedCategory = recommendedCategorySchema.brand(
  'RecommendedCategory',
);
export type RecommendedCategory = z.infer<typeof RecommendedCategory>;
