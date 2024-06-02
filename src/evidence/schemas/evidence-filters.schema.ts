import { z } from 'nestjs-zod/z';

import { evidenceSchema } from './evidence.schema';

export const evidenceFiltersSchema = evidenceSchema.partial();

export const EvidenceFilters = evidenceFiltersSchema.brand('EvidenceFilters');
export type EvidenceFilters = z.infer<typeof EvidenceFilters>;
