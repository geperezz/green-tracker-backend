import { Module } from '@nestjs/common';

import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [UnitsService],
  exports: [UnitsService],
  controllers: [UnitsController],
})
export class UnitsModule {}
