import { z } from 'nestjs-zod/z';

export const categorySchema = z.object({
  indicatorIndex: z.coerce.number().int().min(0),
  name: z.string().trim().min(1),
});

export const Category = categorySchema.brand('Category');
export type Category = z.infer<typeof Category>;
