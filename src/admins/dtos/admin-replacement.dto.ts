import { createZodDto } from 'nestjs-zod';

import { adminCreationDtoSchema } from './admin-creation.dto';

export const adminReplacementDtoSchema = adminCreationDtoSchema.extend({
  password: adminCreationDtoSchema.shape.password.optional(),
});

export class AdminReplacementDto extends createZodDto(
  adminReplacementDtoSchema,
) {}
