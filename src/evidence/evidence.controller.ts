import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { LoggedInAs } from 'src/auth/logged-in-as.decorator';
import { EvidenceService } from './evidence.service';
import { EvidenceDto } from './dtos/evidence.dto';
import { EvidenceUniqueTraitDto } from './dtos/evidence-unique-trait.dto';
import { EvidencePageDto } from './dtos/evidence-page.dto';
import { ActivityUniqueTraitDto } from './dtos/activity-unique-trait.dto';

@Controller('/activity/:activityId/evidence/')
@ApiTags('Evidence')
@LoggedInAs('superadmin', 'admin')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get('/all/')
  async findAll(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
  ): Promise<EvidenceDto[]> {
    return await this.evidenceService.findAll(activityUniqueTraitDto);
  }

  @Get('/:evidenceNumber/')
  async findOne(
    @Param()
    evidenceUniqueTraitDto: EvidenceUniqueTraitDto,
  ): Promise<EvidenceDto> {
    const evidence = await this.evidenceService.findOne(evidenceUniqueTraitDto);

    if (!evidence) {
      throw new NotFoundException(
        'Evidence not found',
        `There is no evidence No. ${evidenceUniqueTraitDto.evidenceNumber} for the activity with ID ${evidenceUniqueTraitDto.activityId}`,
      );
    }

    return evidence;
  }

  @Get()
  async findPage(
    @Param()
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    @Query()
    paginationOptionsDto: PaginationOptionsDto,
  ): Promise<EvidencePageDto> {
    return await this.evidenceService.findPage(
      activityUniqueTraitDto,
      paginationOptionsDto,
    );
  }
}
