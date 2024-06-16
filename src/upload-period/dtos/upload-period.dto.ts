import { createZodDto } from 'nestjs-zod';

import { UploadPeriod, uploadPeriodSchema } from '../schemas/upload-period.schema';

export const uploadPeriodDtoSchema = uploadPeriodSchema;

export class UploadPeriodDto extends createZodDto(uploadPeriodDtoSchema) {
  static fromSchema(schema: UploadPeriod): UploadPeriodDto {
    return uploadPeriodDtoSchema.parse(schema);
  }
}

