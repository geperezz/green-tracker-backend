import { z } from 'nestjs-zod/z';

export const paginationOptionsSchema = z.object({
  pageIndex: z.number().int().min(1).default(1),
  itemsPerPage: z.number().int().min(1).default(10),
});

export type PaginationOptions = z.infer<typeof paginationOptionsSchema>;
