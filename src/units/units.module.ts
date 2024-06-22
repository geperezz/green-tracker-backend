import { Module, forwardRef } from '@nestjs/common';

import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { UsersModule } from 'src/users/users.module';
import { RecommendedCategoriesModule } from 'src/recommended-categories/recommended-categories.module';
import { ActivitiesModule } from 'src/activities/activities.module';

@Module({
  imports: [
    UsersModule,
    RecommendedCategoriesModule,
    forwardRef(() => ActivitiesModule),
  ],
  providers: [UnitsService],
  exports: [UnitsService],
  controllers: [UnitsController],
})
export class UnitsModule {}
