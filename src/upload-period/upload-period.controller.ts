import { Controller } from '@nestjs/common';
import { UploadPeriodService } from './upload-period.service';

@Controller('upload-period')
export class UploadPeriodController {
  constructor(private readonly uploadPeriodsService: UploadPeriodService) {}
}
