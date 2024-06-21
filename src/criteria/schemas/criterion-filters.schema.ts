import { z } from 'nestjs-zod/z';

import { criterionSchema } from './criterion.schema';

export const criterionFiltersSchema = criterionSchema.partial();

export const CriterionFilters =
  criterionFiltersSchema.brand('CriterionFilters');
export type CriterionFilters = z.infer<typeof CriterionFilters>;
