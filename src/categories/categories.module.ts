import { Module } from '@nestjs/common';

import { CategoriesRepository } from './categories.repository';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CriteriaModule } from 'src/criteria/criteria.module';

@Module({
  imports: [CriteriaModule],
  providers: [CategoriesRepository, CategoriesService],
  exports: [CategoriesRepository],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
