import { Module } from '@nestjs/common';

import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { UsersModule } from 'src/users/users.module';
import { RecommendedCategoriesModule } from 'src/recommended-categories/recommended-categories.module';

@Module({
  imports: [UsersModule, RecommendedCategoriesModule],
  providers: [UnitsService],
  exports: [UnitsService],
  controllers: [UnitsController],
})
export class UnitsModule {}
