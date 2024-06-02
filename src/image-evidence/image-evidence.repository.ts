import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { imageEvidenceTable } from './image-evidence.table';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { ImageEvidenceCreation } from './schemas/image-evidence-creation.schema';
import { ImageEvidence } from './schemas/image-evidence.schema';
import { ImageEvidencePage } from './schemas/image-evidence-page.schema';
import { ImageEvidenceReplacement } from './schemas/image-evidence-replacement.schema';
import { ImageEvidenceUniqueTrait } from './schemas/image-evidence-unique-trait.schema';

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
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [createdImageEvidence] = await transaction
          .insert(imageEvidenceTable)
          .values(creationData)
          .returning();

        return ImageEvidence.parse(createdImageEvidence);
      },
    );
  }

  async findOne(
    imageEvidenceUniqueTrait: ImageEvidenceUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidence | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [foundImageEvidence = null] = await transaction
          .select()
          .from(imageEvidenceTable)
          .where(
            and(
              eq(
                imageEvidenceTable.activityId,
                imageEvidenceUniqueTrait.activityId,
              ),
              eq(
                imageEvidenceTable.evidenceNumber,
                imageEvidenceUniqueTrait.evidenceNumber,
              ),
            ),
          );

        if (!foundImageEvidence) {
          return null;
        }
        return ImageEvidence.parse(foundImageEvidence);
      },
    );
  }

  async findPage(
    paginationOptions: PaginationOptions,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidencePage> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const imageEvidencePageQuery = transaction
          .select()
          .from(imageEvidenceTable)
          .limit(paginationOptions.itemsPerPage)
          .offset(
            paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
          )
          .as('evidence_page');

        const nonValidatedEvidencePage = await transaction
          .select()
          .from(imageEvidencePageQuery);
        const imageEvidencePage = nonValidatedEvidencePage.map((evidence) =>
          ImageEvidence.parse(evidence),
        );

        const [{ evidenceCount: imageEvidenceCount }] = await transaction
          .select({
            evidenceCount: count(imageEvidencePageQuery.evidenceNumber),
          })
          .from(imageEvidencePageQuery);

        return ImageEvidencePage.parse({
          items: imageEvidencePage,
          ...paginationOptions,
          pageCount: Math.ceil(
            imageEvidenceCount / paginationOptions.itemsPerPage,
          ),
          itemCount: imageEvidenceCount,
        });
      },
    );
  }

  async replace(
    imageEvidenceUniqueTrait: ImageEvidenceUniqueTrait,
    replacementData: ImageEvidenceReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidence> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [replacedImageEvidence = null] = await transaction
          .update(imageEvidenceTable)
          .set(replacementData)
          .where(
            and(
              eq(
                imageEvidenceTable.activityId,
                imageEvidenceUniqueTrait.activityId,
              ),
              eq(
                imageEvidenceTable.evidenceNumber,
                imageEvidenceUniqueTrait.evidenceNumber,
              ),
            ),
          )
          .returning();
        if (!replacedImageEvidence) {
          throw new ImageEvidenceNotFoundError();
        }

        return ImageEvidence.parse(replacedImageEvidence);
      },
    );
  }

  async delete(
    imageEvidenceUniqueTrait: ImageEvidenceUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<ImageEvidence> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [deletedImageEvidence = null] = await transaction
          .delete(imageEvidenceTable)
          .where(
            and(
              eq(
                imageEvidenceTable.activityId,
                imageEvidenceUniqueTrait.activityId,
              ),
              eq(
                imageEvidenceTable.evidenceNumber,
                imageEvidenceUniqueTrait.evidenceNumber,
              ),
            ),
          )
          .returning();
        if (!deletedImageEvidence) {
          throw new ImageEvidenceNotFoundError();
        }

        return ImageEvidence.parse(deletedImageEvidence);
      },
    );
  }
}
