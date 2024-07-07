import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { ImageEvidenceDto } from './dtos/image-evidence.dto';
import { ImageEvidenceCreationDto } from './dtos/image-evidence-creation.dto';
import { ActivityUniqueTraitDto } from 'src/evidence/dtos/activity-unique-trait.dto';
import {
  API_PATH_TO_EVIDENCE_FILES,
  FS_PATH_TO_EVIDENCE_FILES,
} from 'src/evidence/evidence.module';
import { EvidenceUniqueTraitDto } from 'src/evidence/dtos/evidence-unique-trait.dto';
import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { EvidenceRepository } from 'src/evidence/evidence.repository';
import { EvidenceCreation } from 'src/evidence/schemas/evidence-creation.schema';
import { ImageEvidenceRepository } from './image-evidence.repository';
import { ImageEvidenceCreation } from './schemas/image-evidence-creation.schema';
import { EvidenceUniqueTrait } from 'src/evidence/schemas/evidence-unique-trait.schema';
import { ImageEvidenceReplacementDto } from './dtos/image-evidence-replacement.dto';
import { EvidenceReplacement } from 'src/evidence/schemas/evidence-replacement.schema';
import { ImageEvidenceReplacement } from './schemas/image-evidence-replacement.schema';
import { EvidenceFilters } from 'src/evidence/schemas/evidence-filters.schema';
import { ManyImageEvidenceCreationDto } from './dtos/many-image-evidence-creation.dto';

export class ImageEvidenceServiceError extends Error {}
export class ImageEvidenceNotFoundError extends Error {}

@Injectable()
export class ImageEvidenceService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private drizzleClient: DrizzleClient,
    private evidenceRepository: EvidenceRepository,
    private imageEvidenceRepository: ImageEvidenceRepository,
  ) {}

  async createImageEvidence(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    creationDataDto: ImageEvidenceCreationDto,
    imageFile: Express.Multer.File,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidenceDto> {
    if (transaction === undefined) {
      return this.drizzleClient.transaction(async (transaction) => {
        return await this.createImageEvidence(
          activityUniqueTraitDto,
          creationDataDto,
          imageFile,
          transaction,
        );
      });
    }

    try {
      const createdEvidence = await this.evidenceRepository.create(
        EvidenceCreation.parse({
          ...activityUniqueTraitDto,
          ...creationDataDto,
          type: 'image',
          link: API_PATH_TO_EVIDENCE_FILES + imageFile.filename,
        }),
        transaction,
      );

      const createdImageEvidence = await this.imageEvidenceRepository.create(
        ImageEvidenceCreation.parse({
          ...creationDataDto,
          ...createdEvidence,
        }),
        transaction,
      );

      return ImageEvidenceDto.create({
        ...createdEvidence,
        ...createdImageEvidence,
      });
    } catch (error) {
      this.removeImageFile(imageFile.filename);

      throw error;
    }
  }

  async findImageEvidence(
    uniqueTraitDto: EvidenceUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidenceDto | null> {
    if (transaction === undefined) {
      return this.drizzleClient.transaction(async (transaction) => {
        return await this.findImageEvidence(uniqueTraitDto, transaction);
      });
    }

    const evidence = await this.evidenceRepository.findOne(
      EvidenceUniqueTrait.parse(uniqueTraitDto),
      transaction,
    );
    if (!evidence || evidence.type !== 'image') {
      return null;
    }

    const imageEvidence = await this.imageEvidenceRepository.findOne(
      EvidenceUniqueTrait.parse(uniqueTraitDto),
      transaction,
    );
    return ImageEvidenceDto.create({ ...evidence, ...imageEvidence });
  }

  async findAllImageEvidence(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidenceDto[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findAllImageEvidence(
          activityUniqueTraitDto,
          transaction,
        );
      });
    }

    const evidence = await this.evidenceRepository.findAll(
      EvidenceFilters.parse({
        activityId: activityUniqueTraitDto.activityId,
        type: 'image',
      }),
      transaction,
    );

    return await Promise.all(
      evidence.map(async (evidence) => {
        const imageEvidence = await this.imageEvidenceRepository.findOne(
          EvidenceUniqueTrait.parse(evidence),
          transaction,
        );
        return ImageEvidenceDto.create({ ...evidence, ...imageEvidence });
      }),
    );
  }

  async replaceImageEvidence(
    uniqueTraitDto: EvidenceUniqueTraitDto,
    replacementDto: ImageEvidenceReplacementDto,
    imageFile: Express.Multer.File,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidenceDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.replaceImageEvidence(
          uniqueTraitDto,
          replacementDto,
          imageFile,
          transaction,
        );
      });
    }

    try {
      const imageEvidenceToReplace =
        await this.findImageEvidence(uniqueTraitDto);
      if (!imageEvidenceToReplace) {
        throw new ImageEvidenceNotFoundError();
      }

      const newEvidence = await this.evidenceRepository.replace(
        EvidenceUniqueTrait.parse(uniqueTraitDto),
        EvidenceReplacement.parse({
          ...uniqueTraitDto,
          ...replacementDto,
          type: 'image',
          link: API_PATH_TO_EVIDENCE_FILES + imageFile.filename,
        }),
        transaction,
      );

      const newImageEvidence = await this.imageEvidenceRepository.replace(
        EvidenceUniqueTrait.parse(newEvidence),
        ImageEvidenceReplacement.parse({ ...newEvidence, ...replacementDto }),
        transaction,
      );

      this.removeImageFile(
        imageEvidenceToReplace.link.substring(
          imageEvidenceToReplace.link.lastIndexOf('/') + 1,
        ),
      );

      return ImageEvidenceDto.create({ ...newEvidence, ...newImageEvidence });
    } catch (error) {
      this.removeImageFile(imageFile.filename);

      throw error;
    }
  }

  async deleteImageEvidence(
    uniqueTraitDto: EvidenceUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidenceDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.deleteImageEvidence(uniqueTraitDto, transaction);
      });
    }

    const imageEvidenceToDelete = await this.findImageEvidence(
      uniqueTraitDto,
      transaction,
    );
    if (!imageEvidenceToDelete) {
      throw new ImageEvidenceNotFoundError();
    }

    await this.evidenceRepository.delete(
      EvidenceUniqueTrait.parse(uniqueTraitDto),
      transaction,
    );

    this.removeImageFile(
      imageEvidenceToDelete.link.substring(
        imageEvidenceToDelete.link.lastIndexOf('/') + 1,
      ),
    );

    return imageEvidenceToDelete;
  }

  private removeImageFile(filename: string): void {
    fs.unlinkSync(path.resolve(FS_PATH_TO_EVIDENCE_FILES, filename));
  }
}
