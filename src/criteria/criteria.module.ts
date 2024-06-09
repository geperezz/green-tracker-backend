import { Module } from '@nestjs/common';
import { CriteriaRepository } from './criteria.repository';
import { CriteriaController } from './criteria.controller';
import { CriteriaService } from './criteria.service';

@Module({
  controllers: [CriteriaController],
  providers: [CriteriaRepository, CriteriaService],
  exports: [CriteriaRepository, CriteriaService],
})
export class CriteriaModule {}
