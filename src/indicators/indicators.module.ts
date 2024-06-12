import { Module } from '@nestjs/common';

import { IndicatorsRepository } from './indicators.repository';
import { IndicatorsController } from './indicators.controller';
import { IndicatorsService } from './indicators.service';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [CategoriesModule],
  providers: [IndicatorsService, IndicatorsRepository],
  exports: [IndicatorsRepository],
  controllers: [IndicatorsController],
})
export class IndicatorsModule {}
