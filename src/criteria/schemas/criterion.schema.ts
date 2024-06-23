import { z } from 'nestjs-zod/z';

import { indicatorSchema } from 'src/indicators/schemas/indicator.schema';

export const criterionSchema = z.object({
  indicatorIndex: indicatorSchema.shape.index,
  subindex: z.coerce.number().int().min(0),
  englishName: z.string().trim().min(1),
  spanishAlias: z.string().trim().min(1),
  categoryName: z.string().trim().min(1).nullable().default(null),
});

export const Criterion = criterionSchema.brand('Criterion');
export type Criterion = z.infer<typeof Criterion>;
