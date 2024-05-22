import { z } from 'nestjs-zod/z';

import { buildPageSchema } from 'src/pagination/schemas/page.schema';
import { indicatorSchema } from './indicator.schema';

export const indicatorsPageSchema = buildPageSchema(indicatorSchema);

export type IndicatorsPage = z.infer<typeof indicatorsPageSchema>;
