import { z } from 'nestjs-zod/z';

import { criterionSchema } from './criterion.schema';

export const criteriaFiltersSchema = criterionSchema.partial();

export const CriteriaFilters = criteriaFiltersSchema.brand('CriteriaFilters');
export type CriteriaFilters = z.infer<typeof CriteriaFilters>;
