import { z } from 'nestjs-zod/z';

import { buildPageSchema } from 'src/pagination/schemas/page.schema';
import { Evidence } from './evidence.schema';

export const evidencePageSchema = buildPageSchema(Evidence);

export const EvidencePage = evidencePageSchema.brand('EvidencePage');
export type EvidencePage = z.infer<typeof EvidencePage>;
