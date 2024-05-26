import { z } from 'nestjs-zod/z';

import { criterionCreationSchema } from './criterion-creation.schema';

export const criterionReplacementSchema = criterionCreationSchema;

export const CriterionReplacement = criterionReplacementSchema.brand(
  'CriterionReplacement',
);
export type CriterionReplacement = z.infer<typeof CriterionReplacement>;
