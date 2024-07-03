import { z } from 'nestjs-zod/z';

import { indicatorSchema } from 'src/indicators/schemas/indicator.schema';

export const categorySchema = z.object({
  indicatorIndex: indicatorSchema.shape.index,
  name: z.string().trim().min(1),
  helpText: z.string().trim().min(1),
});

export const Category = categorySchema.brand('Category');
export type Category = z.infer<typeof Category>;
