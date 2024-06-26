import { Module } from '@nestjs/common';
import { CriteriaRepository } from './criteria.repository';
import { CriteriaController } from './criteria.controller';

@Module({
  controllers: [CriteriaController],
  providers: [CriteriaRepository],
  exports: [CriteriaRepository],
})
export class CriteriaModule {}
