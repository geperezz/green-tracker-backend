import { createZodDto } from 'nestjs-zod';

import { categoryDtoSchema } from './category.dto';
import { z } from 'nestjs-zod/z';

export const categoryCreationPathDtoSchema = categoryDtoSchema.pick({
  indicatorIndex: true
});

type InferredCategoryCreationPathDto = z.infer<typeof categoryCreationPathDtoSchema>;

export class CategoryCreationPathDto extends createZodDto(
  categoryCreationPathDtoSchema,
) {
  indicatorIndex: InferredCategoryCreationPathDto['indicatorIndex'] = super
    .indicatorIndex;
}
