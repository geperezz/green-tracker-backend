import { z } from 'nestjs-zod/z';

import { criterionCreationSchema } from './criterion-creation.schema';

export const criterionUpdateSchema = criterionCreationSchema
  .partial()
  .refine(
    (updateData) =>
      updateData.indicatorIndex !== undefined ||
      updateData.subindex !== undefined ||
      updateData.englishName !== undefined ||
      updateData.spanishAlias !== undefined ||
      updateData.categoryName !== undefined,
    { message: 'Must update at least one field' },
  );

export const CriterionUpdate = criterionUpdateSchema.brand('CriterionUpdate');
export type CriterionUpdate = z.infer<typeof CriterionUpdate>;
