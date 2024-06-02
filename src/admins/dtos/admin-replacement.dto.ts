import { createZodDto } from 'nestjs-zod';

import { adminCreationDtoSchema } from './admin-creation.dto';

export const adminReplacementDtoSchema = adminCreationDtoSchema;

export class AdminReplacementDto extends createZodDto(
  adminReplacementDtoSchema,
) {}
