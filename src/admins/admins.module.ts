import { Module } from '@nestjs/common';

import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AdminsService],
  exports: [AdminsService],
  controllers: [AdminsController],
})
export class AdminsModule {}
