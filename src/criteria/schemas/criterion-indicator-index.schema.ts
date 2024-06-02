import { z } from 'nestjs-zod/z';
import { criterionSchema } from './criterion.schema';

export const criterionIndicatorIndexSchema = criterionSchema.pick({
  indicatorIndex: true,
});

export const CriterionIndicatorIndex = criterionIndicatorIndexSchema.brand(
  'CriterionIndicatorIndex',
);
export type CriterionIndicatorIndex = z.infer<typeof CriterionIndicatorIndex>;
