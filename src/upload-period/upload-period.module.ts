import { Module } from '@nestjs/common';
import { UploadPeriodService } from './upload-period.service';
import { UnitsModule } from 'src/units/units.module';

@Module({
  imports: [UnitsModule],
  providers: [UploadPeriodService],
  exports: [UploadPeriodService],
})
export class UploadPeriodModule {}
