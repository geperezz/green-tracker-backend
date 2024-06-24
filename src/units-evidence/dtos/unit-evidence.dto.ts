import { z } from 'nestjs-zod/z';

import { evidenceDtoSchema } from 'src/evidence/dtos/evidence.dto';

export const unitEvidenceDtoSchema = evidenceDtoSchema;

export const UnitEvidenceDto = evidenceDtoSchema.brand('UnitEvidenceDto');
export type UnitEvidenceDto = z.infer<typeof UnitEvidenceDto>;
