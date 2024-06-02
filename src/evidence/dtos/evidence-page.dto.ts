import {
  buildPageDtoClass,
  buildPageDtoSchema,
} from 'src/pagination/dtos/page.dto';
import { evidenceDtoSchema } from './evidence.dto';

export const evidencePageDtoSchema = buildPageDtoSchema(evidenceDtoSchema);

export class EvidencePageDto extends buildPageDtoClass(evidenceDtoSchema) {}
