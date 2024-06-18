import { createZodDto } from 'nestjs-zod';

import { uploadPeriodDtoSchema } from './upload-period.dto';

export const uploadPeriodCreationDtoSchema = uploadPeriodDtoSchema;

export class UploadPeriodCreationDto extends createZodDto(
  uploadPeriodCreationDtoSchema,
) {}
