import { z } from 'nestjs-zod/z';
import { criterionSchema } from './criterion.schema';

export const criterionCreationPathSchema = criterionSchema.pick({
  indicatorIndex: true,
});

export const CriterionCreationPath = criterionCreationPathSchema.brand(
  'CriterionCreationPath',
);
export type CriterionCreationPath = z.infer<typeof CriterionCreationPath>;
