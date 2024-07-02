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

import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import {
  EvidenceFeedbackNotFoundError,
  EvidenceFeedbackRepository,
} from './evidence-feedback.repository';
import { EvidenceUniqueTraitDto } from 'src/evidence/dtos/evidence-unique-trait.dto';
import { EvidenceFeedbackCreationDto } from './dtos/evidence-feedback-creation.dto';
import { EvidenceFeedbackReplacementDto } from './dtos/evidence-feedback-replacement.dto';
import { EvidenceFeedbackCreation } from './schemas/evidence-feedback-creation.schema';
import { EvidenceFeedbackDto } from './dtos/evidence-feedback.dto';
import { EvidenceFeedbackUniqueTrait } from './schemas/evidence-feedback-unique-trait.schema';
import { EvidenceUniqueTrait } from 'src/evidence/schemas/evidence-unique-trait.schema';
import { EvidenceFeedbackReplacement } from './schemas/evidence-feedback-replacement.schema';
import { EvidenceFeedbackUniqueTraitDto } from './dtos/evidence-feedback-unique-trait.dto';

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
      await this.evidenceFeedbackRepository.create(
        EvidenceFeedbackCreation.parse({
          ...evidenceUniqueTraitDto,
          ...creationDataDto,
        }),
      );
    return EvidenceFeedbackDto.create(createdCriterionSchema);
  }

  @Get('/:feedback/')
  async findOne(
    @Param()
    uniqueTraitDto: EvidenceFeedbackUniqueTraitDto,
  ): Promise<EvidenceFeedbackDto> {
    const evidenceFeedback = await this.evidenceFeedbackRepository.findOne(
      EvidenceFeedbackUniqueTrait.parse(uniqueTraitDto),
    );

    if (!evidenceFeedback) {
      throw new NotFoundException(
        'Evidence Feedback not found',
        `There is no feedback for activity ${uniqueTraitDto.activityId} evidence ${uniqueTraitDto.evidenceNumber}`,
      );
    }

    return EvidenceFeedbackDto.create(evidenceFeedback);
  }

  @Get()
  async findAll(
    @Param()
    evidenceUniqueTraitDto: EvidenceUniqueTraitDto,
  ) {
    const evidenceFeedbacks = await this.evidenceFeedbackRepository.findAll(
      EvidenceUniqueTrait.parse(evidenceUniqueTraitDto),
    );

    return evidenceFeedbacks;
  }

  @Put('/:feedback/')
  async replace(
    @Param()
    uniqueTraitDto: EvidenceFeedbackUniqueTraitDto,
    @Body()
    replacementDataDto: EvidenceFeedbackReplacementDto,
  ) {
    try {
      return await this.evidenceFeedbackRepository.update(
        EvidenceFeedbackUniqueTrait.parse(uniqueTraitDto),
        EvidenceFeedbackReplacement.parse(replacementDataDto),
      );
    } catch (error) {
      if (error instanceof EvidenceFeedbackNotFoundError) {
        throw new NotFoundException('Evidence feedback not found', {
          description: `There is no feedback for evidence No. ${uniqueTraitDto.evidenceNumber} for the activity with ID ${uniqueTraitDto.activityId}`,
          cause: error,
        });
      }
      throw error;
    }
  }

  @Delete('/:feedback/')
  async delete(
    @Param()
    uniqueTraitDto: EvidenceFeedbackUniqueTraitDto,
  ) {
    try {
      return await this.evidenceFeedbackRepository.delete(
        EvidenceFeedbackUniqueTrait.parse(uniqueTraitDto),
      );
    } catch (error) {
      if (error instanceof EvidenceFeedbackNotFoundError) {
        throw new NotFoundException('Evidence feedback not found', {
          description: `There is no feedback for evidence No. ${uniqueTraitDto.evidenceNumber} for the activity with ID ${uniqueTraitDto.activityId}`,
          cause: error,
        });
      }
      throw error;
    }
  }
}
