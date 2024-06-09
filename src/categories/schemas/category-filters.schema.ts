import { z } from 'nestjs-zod/z';

import { categorySchema } from './category.schema';

export const categoryFiltersSchema = categorySchema.partial();

export const CategoryFilters = categoryFiltersSchema.brand('CategoryFilters');
export type CategoryFilters = z.infer<typeof CategoryFilters>;
