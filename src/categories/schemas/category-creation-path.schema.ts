import { z } from 'nestjs-zod/z';
import { categorySchema } from './category.schema';

export const categoryCreationPathSchema = categorySchema.pick({
  indicatorIndex: true,
});

export const CategoryCreationPath = categoryCreationPathSchema.brand(
  'CategoryCreationPath',
);
export type CategoryCreationPath = z.infer<typeof CategoryCreationPath>;
