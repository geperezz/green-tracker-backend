import { Module } from '@nestjs/common';

import { RecommendedCategoriesRepository } from './recommended-categories.repository';

@Module({
  providers: [RecommendedCategoriesRepository],
  exports: [RecommendedCategoriesRepository],
})
export class RecommendedCategoriesModule {}
