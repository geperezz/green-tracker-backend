import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import {
  PaginationOptions,
  paginationOptionsSchema,
} from '../schemas/pagination-options.schema';

export const paginationOptionsDtoSchema = paginationOptionsSchema.partial();

export class PaginationOptionsDto extends createZodDto(
  paginationOptionsDtoSchema,
) {
  pageIndex?: z.infer<typeof paginationOptionsDtoSchema>['pageIndex'] = super
    .pageIndex;
  itemsPerPage?: z.infer<typeof paginationOptionsDtoSchema>['itemsPerPage'] =
    super.itemsPerPage;

  static toSchema(
    paginationOptionsDto: PaginationOptionsDto,
  ): PaginationOptions {
    return paginationOptionsSchema.parse({
      pageIndex: paginationOptionsDto.pageIndex,
      itemsPerPage: paginationOptionsDto.itemsPerPage,
    });
  }
}
