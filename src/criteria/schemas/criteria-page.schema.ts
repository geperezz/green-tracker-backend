import { z } from 'nestjs-zod/z';

import { buildPageSchema } from 'src/pagination/schemas/page.schema';
import { criterionSchema } from './criterion.schema';

export const criteriaPageSchema = buildPageSchema(criterionSchema);

export type CriteriaPage = z.infer<typeof criteriaPageSchema>;
