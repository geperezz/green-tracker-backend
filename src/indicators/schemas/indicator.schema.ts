import { z } from 'nestjs-zod/z';

export const indicatorSchema = z.object({
  index: z.coerce.number().int().min(0),
  englishName: z.string().trim().min(1),
  spanishAlias: z.string().trim().min(1),
});

export type Indicator = z.infer<typeof indicatorSchema>;
