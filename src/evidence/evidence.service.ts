import { Inject, Injectable } from '@nestjs/common';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { EvidenceCreationDto } from './dtos/evidence-creation.dto';
import { EvidenceUniqueTraitDto } from './dtos/evidence-unique-trait.dto';
import { EvidenceDto } from './dtos/evidence.dto';
import { EvidencePageDto } from './dtos/evidence-page.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { EvidenceReplacementDto } from './dtos/evidence-replacement.dto';
import { EvidenceRepository } from './evidence.repository';
import { ImageEvidenceRepository } from 'src/image-evidence/image-evidence.repository';
import { EvidenceCreation } from './schemas/evidence-creation.schema';
import { ImageEvidenceCreation } from 'src/image-evidence/schemas/image-evidence-creation.schema';
import { EvidenceUniqueTrait } from './schemas/evidence-unique-trait.schema';
import { ImageEvidenceUniqueTrait } from 'src/image-evidence/schemas/image-evidence-unique-trait.schema';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { EvidenceReplacement } from './schemas/evidence-replacement.schema';
import { ImageEvidenceReplacement } from 'src/image-evidence/schemas/image-evidence-replacement.schema';
import { ActivityUniqueTraitDto } from './dtos/activity-unique-trait.dto';
import { EvidenceFilters } from './schemas/evidence-filters.schema';
import { ManyEvidenceCreationDto } from './dtos/many-evidence-creation.dto';

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

  async create(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    evidenceCreationDto: EvidenceCreationDto,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const createdEvidence = await this.evidenceRepository.create(
          EvidenceCreation.parse({
            ...evidenceCreationDto,
            activityId: activityUniqueTraitDto.activityId,
          }),
          transaction,
        );

        if (evidenceCreationDto.type === 'image') {
          const createdImageEvidence =
            await this.imageEvidenceRepository.create(
              ImageEvidenceCreation.parse(createdEvidence),
              transaction,
            );

          return EvidenceDto.parse({
            ...createdEvidence,
            ...createdImageEvidence,
          });
        }

        return EvidenceDto.parse(createdEvidence);
      },
    );
  }

  async createMany(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    manyEvidenceCreationDto: ManyEvidenceCreationDto,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceDto[]> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        return await Promise.all(
          manyEvidenceCreationDto.evidenceToCreate.map(
            async (evidenceCreationDto) =>
              await this.create(
                activityUniqueTraitDto,
                EvidenceCreationDto.parse(evidenceCreationDto),
                transaction,
              ),
          ),
        );
      },
    );
  }

  async findOne(
    evidenceUniqueTraitDto: EvidenceUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceDto | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const evidence = await this.evidenceRepository.findOne(
          EvidenceUniqueTrait.parse(evidenceUniqueTraitDto),
          transaction,
        );
        if (!evidence) {
          return null;
        }

        if (evidence.type === 'image') {
          const imageEvidence = await this.imageEvidenceRepository.findOne(
            ImageEvidenceUniqueTrait.parse(evidenceUniqueTraitDto),
            transaction,
          );
          return EvidenceDto.parse({ ...evidence, ...imageEvidence });
        }

        return EvidenceDto.parse(evidence);
      },
    );
  }

  async findPage(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    paginationOptionsDto: PaginationOptionsDto,
    transaction?: DrizzleTransaction,
  ): Promise<EvidencePageDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
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
                const imageEvidence =
                  await this.imageEvidenceRepository.findOne(
                    ImageEvidenceUniqueTrait.parse(evidence),
                    transaction,
                  );
                return EvidenceDto.parse({ ...evidence, ...imageEvidence });
              }
              return EvidenceDto.parse(evidence);
            }),
          ),
        };
      },
    );
  }

  async replace(
    evidenceUniqueTraitDto: EvidenceUniqueTraitDto,
    evidenceReplacementDto: EvidenceReplacementDto,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const evidenceToReplace = await this.findOne(evidenceUniqueTraitDto);
        if (!evidenceToReplace) {
          throw new EvidenceNotFoundError();
        }

        if (evidenceToReplace.type !== evidenceReplacementDto.type) {
          throw new EvidenceReplacementTypeMismatchError(
            evidenceToReplace.type,
            evidenceReplacementDto.type,
          );
        }

        const newEvidence = await this.evidenceRepository.replace(
          EvidenceUniqueTrait.parse(evidenceUniqueTraitDto),
          EvidenceReplacement.parse(evidenceReplacementDto),
          transaction,
        );

        if (newEvidence.type === 'image') {
          const newImageEvidence = await this.imageEvidenceRepository.replace(
            ImageEvidenceUniqueTrait.parse(newEvidence),
            ImageEvidenceReplacement.parse(evidenceReplacementDto),
            transaction,
          );
          return EvidenceDto.parse({ ...newEvidence, ...newImageEvidence });
        }

        return EvidenceDto.parse(newEvidence);
      },
    );
  }

  async delete(
    evidenceUniqueTraitDto: EvidenceUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<EvidenceDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const evidenceToDelete = await this.findOne(evidenceUniqueTraitDto);
        if (!evidenceToDelete) {
          throw new EvidenceNotFoundError();
        }

        await this.evidenceRepository.delete(
          EvidenceUniqueTrait.parse(evidenceUniqueTraitDto),
          transaction,
        );

        return EvidenceDto.parse(evidenceToDelete);
      },
    );
  }
}
