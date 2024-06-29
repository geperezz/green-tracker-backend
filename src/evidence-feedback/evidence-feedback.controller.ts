import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import { EvidenceFeedbackRepository } from './evidence-feedback.repository';
import { EvidenceUniqueTraitDto } from 'src/evidence/dtos/evidence-unique-trait.dto';
import { EvidenceFeedbackCreationDto } from './dtos/evidence-feedback-creation.dto';
import { EvidenceFeedbackCreation } from './schemas/evidence-feedback-creation.schema';
import { EvidenceFeedbackDto } from './dtos/evidence-feedback.dto';

@Controller('/activity/:activityId/evidence/:evidenceNumber/feedback')
@ApiTags('EvidenceFeedback')
@LoggedInAs('superadmin', 'admin')
export class EvidenceFeedbackController {
  constructor(
    private readonly evidenceFeedbackRepository: EvidenceFeedbackRepository,
  ) {}

  @Post()
  async create(
    @Param()
    evidenceUniqueTraitDto: EvidenceUniqueTraitDto,
    @Body()
    creationDataDto: EvidenceFeedbackCreationDto,
  ): Promise<EvidenceFeedbackDto> {
    const createdCriterionSchema =
      await this.evidenceFeedbackRepository.createEvidenceFeedback(
        EvidenceFeedbackCreation.parse({
          ...evidenceUniqueTraitDto,
          ...creationDataDto,
        }),
      );
    return EvidenceFeedbackDto.create(createdCriterionSchema);
  }
}
