import { createZodDto } from 'nestjs-zod';

import { adminDtoSchema } from './admin.dto';
import { z } from 'nestjs-zod/z';

export const adminUniqueTraitDtoSchema = adminDtoSchema.pick({
  id: true,
});

type InferredAdminUniqueTraitDto = z.infer<typeof adminUniqueTraitDtoSchema>;

export class AdminUniqueTraitDto extends createZodDto(
  adminUniqueTraitDtoSchema,
) {
  id: InferredAdminUniqueTraitDto['id'] = super.id;
}
