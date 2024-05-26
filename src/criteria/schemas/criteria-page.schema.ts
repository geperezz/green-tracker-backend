import { z } from 'nestjs-zod/z';

import { buildPageSchema } from 'src/pagination/schemas/page.schema';
import { Criterion } from './criterion.schema';

export const criteriaPageSchema = buildPageSchema(Criterion);

export const CriteriaPage = criteriaPageSchema.brand('CriteriaPage');
export type CriteriaPage = z.infer<typeof criteriaPageSchema>;
