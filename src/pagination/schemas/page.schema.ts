import { z } from 'nestjs-zod/z';

export function buildPageSchema<ItemSchema extends z.ZodTypeAny>(
  itemSchema: ItemSchema,
) {
  return z.object({
    items: z.array(itemSchema),
    pageIndex: z.number().int().min(1),
    itemsPerPage: z.number().int().min(1),
    pageCount: z.number().int().min(0),
    itemCount: z.number().int().min(0),
  });
}
