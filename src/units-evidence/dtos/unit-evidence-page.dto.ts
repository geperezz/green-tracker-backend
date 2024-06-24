import {
  buildPageDtoClass,
  buildPageDtoSchema,
} from 'src/pagination/dtos/page.dto';
import { unitEvidenceDtoSchema } from './unit-evidence.dto';

export const unitEvidencePageDtoSchema = buildPageDtoSchema(
  unitEvidenceDtoSchema,
);

export class UnitEvidencePageDto extends buildPageDtoClass(
  unitEvidenceDtoSchema,
) {}
