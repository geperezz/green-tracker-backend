import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { buildPageSchema } from '../schemas/page.schema';

export function buildPageDtoSchema<ItemSchema extends z.ZodTypeAny>(
  itemSchema: ItemSchema,
) {
  return buildPageSchema(itemSchema);
}

export function buildPageDtoClass<ItemSchema extends z.ZodTypeAny>(
  itemSchema: ItemSchema,
) {
  return createZodDto(buildPageDtoSchema(itemSchema));
}
