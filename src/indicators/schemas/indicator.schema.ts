import { z } from 'nestjs-zod/z';

export const indicatorSchema = z.object({
  index: z.coerce.number().int().min(0),
  englishName: z.string().trim().min(1),
  spanishAlias: z.string().trim().min(1),
});

export const Indicator = indicatorSchema.brand('Indicator');
export type Indicator = z.infer<typeof Indicator>;
