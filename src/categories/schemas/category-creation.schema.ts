import { z } from 'nestjs-zod/z';

import { categorySchema } from './category.schema';

export const categoryCreationSchema = categorySchema;

export const CategoryCreation =
  categoryCreationSchema.brand('CategoryCreation');
export type CategoryCreation = z.infer<typeof CategoryCreation>;
