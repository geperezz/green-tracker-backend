import { z } from 'nestjs-zod/z';

import { categoryCreationSchema } from './category-creation.schema';

export const categoryReplacementSchema = categoryCreationSchema;

export const CategoryReplacement = categoryReplacementSchema.brand(
  'CategoryReplacement',
);
export type CategoryReplacement = z.infer<typeof CategoryReplacement>;
