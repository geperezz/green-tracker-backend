import { unitEvidenceCreationDtoSchema } from './unit-evidence-creation.dto';
import { z } from 'nestjs-zod/z';

export const unitEvidenceReplacementDtoSchema = unitEvidenceCreationDtoSchema;

export const UnitEvidenceReplacementDto =
  unitEvidenceReplacementDtoSchema.brand('UnitEvidenceReplacementDto');
export type UnitEvidenceReplacementDto = z.infer<
  typeof UnitEvidenceReplacementDto
>;
