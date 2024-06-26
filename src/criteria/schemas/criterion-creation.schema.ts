import { z } from 'nestjs-zod/z';

import { criterionSchema } from './criterion.schema';

export const criterionCreationSchema = criterionSchema;

export const CriterionCreation =
  criterionCreationSchema.brand('CriterionCreation');
export type CriterionCreation = z.infer<typeof CriterionCreation>;
