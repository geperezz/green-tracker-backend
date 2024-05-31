import { z } from 'nestjs-zod/z';
import { categorySchema } from './category.schema';

export const categoryUniqueTraitSchema = categorySchema.pick({
  indicatorIndex: true,
  name: true,
});

export const CategoryUniqueTrait = categoryUniqueTraitSchema.brand(
  'CategoryUniqueTrait',
);
export type CategoryUniqueTrait = z.infer<typeof CategoryUniqueTrait>;
