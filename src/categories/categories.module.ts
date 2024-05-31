import { Module } from '@nestjs/common';

import { CategoriesRepository } from './categories.repository';
import { CategoriesController } from './categories.controller';

@Module({
  providers: [CategoriesRepository],
  exports: [CategoriesRepository],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
