import { createZodDto } from 'nestjs-zod';

import { uploadPeriodSchema } from '../schemas/upload-period.schema';

export const uploadPeriodDtoSchema = uploadPeriodSchema;

export class UploadPeriodDto extends createZodDto(uploadPeriodDtoSchema) {}

