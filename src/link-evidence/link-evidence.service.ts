import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { LinkEvidenceDto } from './dtos/link-evidence.dto';
import { LinkEvidenceCreationDto } from './dtos/link-evidence-creation.dto';
import { ActivityUniqueTraitDto } from 'src/evidence/dtos/activity-unique-trait.dto';
import {
  API_PATH_TO_EVIDENCE_FILES,
  FS_PATH_TO_EVIDENCE_FILES,
} from 'src/evidence/evidence.module';
import { EvidenceUniqueTraitDto } from 'src/evidence/dtos/evidence-unique-trait.dto';
import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { EvidenceRepository } from 'src/evidence/evidence.repository';
import { EvidenceCreation } from 'src/evidence/schemas/evidence-creation.schema';
import { EvidenceUniqueTrait } from 'src/evidence/schemas/evidence-unique-trait.schema';
import { LinkEvidenceReplacementDto } from './dtos/link-evidence-replacement.dto';
import { EvidenceReplacement } from 'src/evidence/schemas/evidence-replacement.schema';
import { EvidenceFilters } from 'src/evidence/schemas/evidence-filters.schema';

export class LinkEvidenceServiceError extends Error {}
export class LinkEvidenceNotFoundError extends Error {}

@Injectable()
export class LinkEvidenceService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private drizzleClient: DrizzleClient,
    private evidenceRepository: EvidenceRepository,
  ) {}

  async createLinkEvidence(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    creationDataDto: LinkEvidenceCreationDto,
    transaction?: DrizzleTransaction,
  ): Promise<LinkEvidenceDto> {
    if (transaction === undefined) {
      return this.drizzleClient.transaction(async (transaction) => {
        return await this.createLinkEvidence(
          activityUniqueTraitDto,
          creationDataDto,
          transaction,
        );
      });
    }

    const createdEvidence = await this.evidenceRepository.create(
      EvidenceCreation.parse({
        ...activityUniqueTraitDto,
        ...creationDataDto,
        type: 'link',
      }),
      transaction,
    );

    return LinkEvidenceDto.create(createdEvidence);
  }

  async findLinkEvidence(
    uniqueTraitDto: EvidenceUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<LinkEvidenceDto | null> {
    if (transaction === undefined) {
      return this.drizzleClient.transaction(async (transaction) => {
        return await this.findLinkEvidence(uniqueTraitDto, transaction);
      });
    }

    const evidence = await this.evidenceRepository.findOne(
      EvidenceUniqueTrait.parse(uniqueTraitDto),
      transaction,
    );
    if (!evidence || evidence.type !== 'link') {
      return null;
    }

    return LinkEvidenceDto.create(evidence);
  }

  async findAllLinkEvidence(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<LinkEvidenceDto[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findAllLinkEvidence(
          activityUniqueTraitDto,
          transaction,
        );
      });
    }

    const evidence = await this.evidenceRepository.findAll(
      EvidenceFilters.parse({
        activityId: activityUniqueTraitDto.activityId,
        type: 'link',
      }),
      transaction,
    );

    return await Promise.all(
      evidence.map(async (evidence) => {
        return LinkEvidenceDto.create(evidence);
      }),
    );
  }

  async replaceLinkEvidence(
    uniqueTraitDto: EvidenceUniqueTraitDto,
    replacementDto: LinkEvidenceReplacementDto,
    transaction?: DrizzleTransaction,
  ): Promise<LinkEvidenceDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.replaceLinkEvidence(
          uniqueTraitDto,
          replacementDto,
          transaction,
        );
      });
    }

    const linkEvidenceToReplace = await this.findLinkEvidence(uniqueTraitDto);
    if (!linkEvidenceToReplace) {
      throw new LinkEvidenceNotFoundError();
    }

    const newEvidence = await this.evidenceRepository.replace(
      EvidenceUniqueTrait.parse(uniqueTraitDto),
      EvidenceReplacement.parse({
        ...uniqueTraitDto,
        ...replacementDto,
        type: 'link',
      }),
      transaction,
    );

    return LinkEvidenceDto.create(newEvidence);
  }

  async deleteLinkEvidence(
    uniqueTraitDto: EvidenceUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<LinkEvidenceDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.deleteLinkEvidence(uniqueTraitDto, transaction);
      });
    }

    const linkEvidenceToDelete = await this.findLinkEvidence(
      uniqueTraitDto,
      transaction,
    );
    if (!linkEvidenceToDelete) {
      throw new LinkEvidenceNotFoundError();
    }

    await this.evidenceRepository.delete(
      EvidenceUniqueTrait.parse(uniqueTraitDto),
      transaction,
    );

    return linkEvidenceToDelete;
  }
}
