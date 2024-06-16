import { createZodDto } from 'nestjs-zod';

import { uploadPeriodDtoSchema } from './upload-period.dto';

export const uploadPeriodReplacementDtoSchema = uploadPeriodDtoSchema.omit({
  id: true,
});

export class UploadPeriodReplacementDto extends createZodDto(
  uploadPeriodReplacementDtoSchema,
) {}
