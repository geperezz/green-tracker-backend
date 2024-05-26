import { z } from 'nestjs-zod/z';
import { criterionSchema } from './criterion.schema';

export const criterionUniqueTraitSchema = criterionSchema.pick({
  indicatorIndex: true,
  subindex: true,
});

export const CriterionUniqueTrait = criterionUniqueTraitSchema.brand(
  'CriterionUniqueTrait',
);
export type CriterionUniqueTrait = z.infer<typeof CriterionUniqueTrait>;
