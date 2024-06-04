import { z } from 'nestjs-zod/z';

import { buildPageSchema } from 'src/pagination/schemas/page.schema';
import { Indicator } from './indicator.schema';

export const indicatorsPageSchema = buildPageSchema(Indicator);

export const IndicatorsPage = indicatorsPageSchema.brand('IndicatorsPage');
export type IndicatorsPage = z.infer<typeof IndicatorsPage>;
