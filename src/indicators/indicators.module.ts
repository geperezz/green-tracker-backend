import { Module } from '@nestjs/common';

import { IndicatorsRepository } from './indicators.repository';
import { IndicatorsController } from './indicators.controller';

@Module({
  providers: [IndicatorsRepository],
  exports: [IndicatorsRepository],
  controllers: [IndicatorsController],
})
export class IndicatorsModule {}
