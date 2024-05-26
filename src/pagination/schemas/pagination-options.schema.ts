import { z } from 'nestjs-zod/z';

export const paginationOptionsSchema = z.object({
  pageIndex: z.number().int().min(1).default(1),
  itemsPerPage: z.number().int().min(1).default(10),
});

export const PaginationOptions =
  paginationOptionsSchema.brand('PaginationOptions');
export type PaginationOptions = z.infer<typeof paginationOptionsSchema>;
