import { Module } from '@nestjs/common';
import { EvidenceFeedbackRepository } from './evidence-feedback.repository';
import { EvidenceFeedbackController } from './evidence-feedback.controller';

@Module({
  controllers: [EvidenceFeedbackController],
  providers: [EvidenceFeedbackRepository],
  exports: [EvidenceFeedbackRepository],
})
export class EvidenceFeedbackModule {}
