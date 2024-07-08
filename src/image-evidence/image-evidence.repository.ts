import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { imageEvidenceTable } from './image-evidence.table';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { ImageEvidenceCreation } from './schemas/image-evidence-creation.schema';
import { ImageEvidence } from './schemas/image-evidence.schema';
import { ImageEvidencePage } from './schemas/image-evidence-page.schema';
import { ImageEvidenceReplacement } from './schemas/image-evidence-replacement.schema';
import { EvidenceUniqueTrait } from 'src/evidence/schemas/evidence-unique-trait.schema';

export abstract class ImageEvidenceRepositoryError extends Error {}
export class ImageEvidenceNotFoundError extends ImageEvidenceRepositoryError {}

@Injectable()
export class ImageEvidenceRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async create(
    creationData: ImageEvidenceCreation,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidence> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.create(creationData, transaction);
      });
    }

    const [createdImageEvidence] = await transaction
      .insert(imageEvidenceTable)
      .values(creationData)
      .returning();

    return ImageEvidence.parse(createdImageEvidence);
  }

  async findOne(
    uniqueTrait: EvidenceUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidence | null> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findOne(uniqueTrait, transaction);
      });
    }

    const [foundImageEvidence = null] = await transaction
      .select()
      .from(imageEvidenceTable)
      .where(
        and(
          eq(imageEvidenceTable.activityId, uniqueTrait.activityId),
          eq(imageEvidenceTable.evidenceNumber, uniqueTrait.evidenceNumber),
        ),
      );

    if (!foundImageEvidence) {
      return null;
    }
    return ImageEvidence.parse(foundImageEvidence);
  }

  async findPage(
    paginationOptions: PaginationOptions,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidencePage> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findPage(paginationOptions, transaction);
      });
    }

    return await this.drizzleClient.transaction(async (transaction) => {
      const filteredImageEvidenceQuery = transaction
        .select()
        .from(imageEvidenceTable)
        .as('filtered_image_evidence');

      const nonValidatedEvidencePage = await transaction
        .select()
        .from(filteredImageEvidenceQuery)
        .limit(paginationOptions.itemsPerPage)
        .offset(
          paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
        );
      const imageEvidencePage = nonValidatedEvidencePage.map((evidence) =>
        ImageEvidence.parse(evidence),
      );

      const [{ evidenceCount: imageEvidenceCount }] = await transaction
        .select({
          evidenceCount: count(filteredImageEvidenceQuery.evidenceNumber),
        })
        .from(filteredImageEvidenceQuery);

      return ImageEvidencePage.parse({
        items: imageEvidencePage,
        ...paginationOptions,
        pageCount: Math.ceil(
          imageEvidenceCount / paginationOptions.itemsPerPage,
        ),
        itemCount: imageEvidenceCount,
      });
    });
  }

  async replace(
    uniqueTrait: EvidenceUniqueTrait,
    replacementData: ImageEvidenceReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidence> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.replace(uniqueTrait, replacementData, transaction);
      });
    }

    const [replacedImageEvidence = null] = await transaction
      .update(imageEvidenceTable)
      .set(replacementData)
      .where(
        and(
          eq(imageEvidenceTable.activityId, uniqueTrait.activityId),
          eq(imageEvidenceTable.evidenceNumber, uniqueTrait.evidenceNumber),
        ),
      )
      .returning();
    if (!replacedImageEvidence) {
      throw new ImageEvidenceNotFoundError();
    }

    return ImageEvidence.parse(replacedImageEvidence);
  }

  async delete(
    uniqueTrait: EvidenceUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidence> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.delete(uniqueTrait, transaction);
      });
    }

    const [deletedImageEvidence = null] = await transaction
      .delete(imageEvidenceTable)
      .where(
        and(
          eq(imageEvidenceTable.activityId, uniqueTrait.activityId),
          eq(imageEvidenceTable.evidenceNumber, uniqueTrait.evidenceNumber),
        ),
      )
      .returning();
    if (!deletedImageEvidence) {
      throw new ImageEvidenceNotFoundError();
    }

    return ImageEvidence.parse(deletedImageEvidence);
  }
}
