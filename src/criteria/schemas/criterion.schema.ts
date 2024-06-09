import { z } from 'nestjs-zod/z';

export const criterionSchema = z.object({
  indicatorIndex: z.coerce.number().int().min(0),
  subindex: z.coerce.number().int().min(0),
  englishName: z.string().trim().min(1),
  spanishAlias: z.string().trim().min(1),
  categoryName: z.string().trim().min(1).nullable(),
});

export const Criterion = criterionSchema.brand('Criterion');
export type Criterion = z.infer<typeof Criterion>;
