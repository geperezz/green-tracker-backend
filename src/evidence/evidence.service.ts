import { Inject, Injectable } from '@nestjs/common';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { EvidenceUniqueTraitDto } from './dtos/evidence-unique-trait.dto';
import { EvidenceDto } from './dtos/evidence.dto';
import { EvidencePageDto } from './dtos/evidence-page.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { EvidenceRepository } from './evidence.repository';
import { ImageEvidenceRepository } from 'src/image-evidence/image-evidence.repository';
import { EvidenceUniqueTrait } from './schemas/evidence-unique-trait.schema';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { ActivityUniqueTraitDto } from './dtos/activity-unique-trait.dto';
import { EvidenceFilters } from './schemas/evidence-filters.schema';

export abstract class EvidenceServiceError extends Error {}
export class EvidenceNotFoundError extends EvidenceServiceError {}
export class EvidenceReplacementTypeMismatchError extends EvidenceServiceError {
  constructor(
    public readonly expectedType: EvidenceDto['type'],
    public readonly receivedType: EvidenceDto['type'],
  ) {
    super();
  }
}

@Injectable()
export class EvidenceService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly evidenceRepository: EvidenceRepository,
    private readonly imageEvidenceRepository: ImageEvidenceRepository,
  ) {}

  async findOne(
    evidenceUniqueTraitDto: EvidenceUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceDto | null> {
    if (transaction === undefined) {
      return await (transaction ?? this.drizzleClient).transaction(
        async (transaction) => {
          return await this.findOne(evidenceUniqueTraitDto, transaction);
        },
      );
    }

    const evidence = await this.evidenceRepository.findOne(
      EvidenceUniqueTrait.parse(evidenceUniqueTraitDto),
      transaction,
    );
    if (!evidence) {
      return null;
    }

    if (evidence.type === 'image') {
      const imageEvidence = await this.imageEvidenceRepository.findOne(
        EvidenceUniqueTrait.parse(evidenceUniqueTraitDto),
        transaction,
      );
      return EvidenceDto.parse({ ...evidence, ...imageEvidence });
    }

    return EvidenceDto.parse(evidence);
  }

  async findPage(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    paginationOptionsDto: PaginationOptionsDto,
    transaction?: DrizzleTransaction,
  ): Promise<EvidencePageDto> {
    if (transaction === undefined) {
      return await (transaction ?? this.drizzleClient).transaction(
        async (transaction) => {
          return await this.findPage(
            activityUniqueTraitDto,
            paginationOptionsDto,
            transaction,
          );
        },
      );
    }

    const evidencePage = await this.evidenceRepository.findPage(
      PaginationOptions.parse(paginationOptionsDto),
      EvidenceFilters.parse({
        activityId: activityUniqueTraitDto.activityId,
      }),
      transaction,
    );

    return {
      ...evidencePage,
      items: await Promise.all(
        evidencePage.items.map(async (evidence) => {
          if (evidence.type === 'image') {
            const imageEvidence = await this.imageEvidenceRepository.findOne(
              EvidenceUniqueTrait.parse(evidence),
              transaction,
            );
            return EvidenceDto.parse({ ...evidence, ...imageEvidence });
          }
          return EvidenceDto.parse(evidence);
        }),
      ),
    };
  }

  async findAll(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceDto[]> {
    if (transaction === undefined) {
      return await (transaction ?? this.drizzleClient).transaction(
        async (transaction) => {
          return await this.findAll(activityUniqueTraitDto, transaction);
        },
      );
    }

    const evidence = await this.evidenceRepository.findAll(
      EvidenceFilters.parse({
        activityId: activityUniqueTraitDto.activityId,
      }),
      transaction,
    );

    return await Promise.all(
      evidence.map(async (evidence) => {
        if (evidence.type === 'image') {
          const imageEvidence = await this.imageEvidenceRepository.findOne(
            EvidenceUniqueTrait.parse(evidence),
            transaction,
          );
          return EvidenceDto.parse({ ...evidence, ...imageEvidence });
        }
        return EvidenceDto.parse(evidence);
      }),
    );
  }
}
