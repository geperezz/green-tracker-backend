import { Module } from '@nestjs/common';
import { UploadPeriodService } from './upload-period.service';
import { UnitsModule } from 'src/units/units.module';
import { UploadPeriodRepository } from './upload-period.repository';
import { UploadPeriodController } from './upload-period.controller';

@Module({
  imports: [UnitsModule],
  providers: [UploadPeriodService, UploadPeriodRepository],
  exports: [UploadPeriodService, UploadPeriodRepository],
  controllers: [UploadPeriodController]
})
export class UploadPeriodModule {}
