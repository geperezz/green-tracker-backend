import { z } from 'nestjs-zod/z';

import { buildPageSchema } from 'src/pagination/schemas/page.schema';
import { Category } from './category.schema';

export const categoriesPageSchema = buildPageSchema(Category);

export const CategoriesPage = categoriesPageSchema.brand('CategoriesPage');
export type CategoriesPage = z.infer<typeof categoriesPageSchema>;
