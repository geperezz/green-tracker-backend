import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { DocumentEvidenceDto } from './dtos/document-evidence.dto';
import { DocumentEvidenceCreationDto } from './dtos/document-evidence-creation.dto';
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
import { DocumentEvidenceReplacementDto } from './dtos/document-evidence-replacement.dto';
import { EvidenceReplacement } from 'src/evidence/schemas/evidence-replacement.schema';
import { EvidenceFilters } from 'src/evidence/schemas/evidence-filters.schema';

export class DocumentEvidenceServiceError extends Error {}
export class DocumentEvidenceNotFoundError extends Error {}

@Injectable()
export class DocumentEvidenceService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private drizzleClient: DrizzleClient,
    private evidenceRepository: EvidenceRepository,
  ) {}

  async createDocumentEvidence(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    creationDataDto: DocumentEvidenceCreationDto,
    documentFile: Express.Multer.File,
    transaction?: DrizzleTransaction,
  ): Promise<DocumentEvidenceDto> {
    if (transaction === undefined) {
      return this.drizzleClient.transaction(async (transaction) => {
        return await this.createDocumentEvidence(
          activityUniqueTraitDto,
          creationDataDto,
          documentFile,
          transaction,
        );
      });
    }

    try {
      const createdEvidence = await this.evidenceRepository.create(
        EvidenceCreation.parse({
          ...activityUniqueTraitDto,
          ...creationDataDto,
          type: 'document',
          link: API_PATH_TO_EVIDENCE_FILES + documentFile.filename,
        }),
        transaction,
      );

      return DocumentEvidenceDto.create(createdEvidence);
    } catch (error) {
      this.removeDocumentFile(documentFile.filename);

      throw error;
    }
  }

  async findDocumentEvidence(
    uniqueTraitDto: EvidenceUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<DocumentEvidenceDto | null> {
    if (transaction === undefined) {
      return this.drizzleClient.transaction(async (transaction) => {
        return await this.findDocumentEvidence(uniqueTraitDto, transaction);
      });
    }

    const evidence = await this.evidenceRepository.findOne(
      EvidenceUniqueTrait.parse(uniqueTraitDto),
      transaction,
    );
    if (!evidence || evidence.type !== 'document') {
      return null;
    }

    return DocumentEvidenceDto.create(evidence);
  }

  async findAllDocumentEvidence(
    activityUniqueTraitDto: ActivityUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<DocumentEvidenceDto[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findAllDocumentEvidence(
          activityUniqueTraitDto,
          transaction,
        );
      });
    }

    const evidence = await this.evidenceRepository.findAll(
      EvidenceFilters.parse({
        activityId: activityUniqueTraitDto.activityId,
        type: 'document',
      }),
      transaction,
    );

    return await Promise.all(
      evidence.map(async (evidence) => {
        return DocumentEvidenceDto.create(evidence);
      }),
    );
  }

  async replaceDocumentEvidence(
    uniqueTraitDto: EvidenceUniqueTraitDto,
    replacementDto: DocumentEvidenceReplacementDto,
    documentFile: Express.Multer.File,
    transaction?: DrizzleTransaction,
  ): Promise<DocumentEvidenceDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.replaceDocumentEvidence(
          uniqueTraitDto,
          replacementDto,
          documentFile,
          transaction,
        );
      });
    }

    try {
      const documentEvidenceToReplace =
        await this.findDocumentEvidence(uniqueTraitDto);
      if (!documentEvidenceToReplace) {
        throw new DocumentEvidenceNotFoundError();
      }

      const newEvidence = await this.evidenceRepository.replace(
        EvidenceUniqueTrait.parse(uniqueTraitDto),
        EvidenceReplacement.parse({
          ...uniqueTraitDto,
          ...replacementDto,
          type: 'document',
          link: API_PATH_TO_EVIDENCE_FILES + documentFile.filename,
        }),
        transaction,
      );

      this.removeDocumentFile(
        documentEvidenceToReplace.link.substring(
          documentEvidenceToReplace.link.lastIndexOf('/') + 1,
        ),
      );

      return DocumentEvidenceDto.create(newEvidence);
    } catch (error) {
      this.removeDocumentFile(documentFile.filename);

      throw error;
    }
  }

  async deleteDocumentEvidence(
    uniqueTraitDto: EvidenceUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<DocumentEvidenceDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.deleteDocumentEvidence(uniqueTraitDto, transaction);
      });
    }

    const documentEvidenceToDelete = await this.findDocumentEvidence(
      uniqueTraitDto,
      transaction,
    );
    if (!documentEvidenceToDelete) {
      throw new DocumentEvidenceNotFoundError();
    }

    await this.evidenceRepository.delete(
      EvidenceUniqueTrait.parse(uniqueTraitDto),
      transaction,
    );

    this.removeDocumentFile(
      documentEvidenceToDelete.link.substring(
        documentEvidenceToDelete.link.lastIndexOf('/') + 1,
      ),
    );

    return documentEvidenceToDelete;
  }

  private removeDocumentFile(filename: string): void {
    fs.unlinkSync(path.resolve(FS_PATH_TO_EVIDENCE_FILES, filename));
  }
}
