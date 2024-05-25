import { z } from 'nestjs-zod/z';

import { criterionCreationSchema } from './criterion-creation.schema';

export const criterionReplacementSchema = criterionCreationSchema;

export type CriterionReplacement = z.infer<typeof criterionReplacementSchema>;
