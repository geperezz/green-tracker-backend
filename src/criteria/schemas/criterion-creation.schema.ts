import { z } from 'nestjs-zod/z';

import { criterionSchema } from './criterion.schema';

export const criterionCreationSchema = criterionSchema;

export type CriterionCreation = z.infer<typeof criterionSchema>;
