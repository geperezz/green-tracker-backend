import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { evidenceTable } from './evidence.table';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { EvidenceCreation } from './schemas/evidence-creation.schema';
import { Evidence } from './schemas/evidence.schema';
import { EvidencePage } from './schemas/evidence-page.schema';
import { EvidenceReplacement } from './schemas/evidence-replacement.schema';
import { EvidenceUniqueTrait } from './schemas/evidence-unique-trait.schema';
import { EvidenceFilters } from './schemas/evidence-filters.schema';

export abstract class EvidenceRepositoryError extends Error {}
export class EvidenceNotFoundError extends EvidenceRepositoryError {}

@Injectable()
export class EvidenceRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async create(
    creationData: EvidenceCreation,
    transaction?: DrizzleTransaction,
  ): Promise<Evidence> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [createdEvidence] = await transaction
          .insert(evidenceTable)
          .values(creationData)
          .returning();

        return Evidence.parse(createdEvidence);
      },
    );
  }

  async findOne(
    evidenceUniqueTrait: EvidenceUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Evidence | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [foundEvidence = null] = await transaction
          .select()
          .from(evidenceTable)
          .where(
            and(
              eq(evidenceTable.activityId, evidenceUniqueTrait.activityId),
              eq(
                evidenceTable.evidenceNumber,
                evidenceUniqueTrait.evidenceNumber,
              ),
            ),
          );

        if (!foundEvidence) {
          return null;
        }
        return Evidence.parse(foundEvidence);
      },
    );
  }

  async findAll(
    filters?: EvidenceFilters,
    transaction?: DrizzleTransaction,
  ): Promise<Evidence[]> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const nonValidatedEvidence = await transaction
          .select()
          .from(evidenceTable)
          .where(this.transformFiltersToWhereConditions(filters));

        return await Promise.all(
          nonValidatedEvidence.map((evidence) => Evidence.parse(evidence)),
        );
      },
    );
  }

  async findPage(
    paginationOptions: PaginationOptions,
    filters?: EvidenceFilters,
    transaction?: DrizzleTransaction,
  ): Promise<EvidencePage> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const filteredEvidenceQuery = transaction
          .select()
          .from(evidenceTable)
          .where(this.transformFiltersToWhereConditions(filters))
          .as('filtered_evidence');

        const nonValidatedEvidencePage = await transaction
          .select()
          .from(filteredEvidenceQuery)
          .limit(paginationOptions.itemsPerPage)
          .offset(
            paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
          );
        const evidencePage = nonValidatedEvidencePage.map((evidence) =>
          Evidence.parse(evidence),
        );

        const [{ evidenceCount }] = await transaction
          .select({
            evidenceCount: count(filteredEvidenceQuery.evidenceNumber),
          })
          .from(filteredEvidenceQuery);

        return EvidencePage.parse({
          items: evidencePage,
          ...paginationOptions,
          pageCount: Math.ceil(evidenceCount / paginationOptions.itemsPerPage),
          itemCount: evidenceCount,
        });
      },
    );
  }

  private transformFiltersToWhereConditions(filters?: EvidenceFilters) {
    return and(
      filters?.activityId
        ? eq(evidenceTable.activityId, filters.activityId)
        : undefined,
      filters?.evidenceNumber
        ? eq(evidenceTable.evidenceNumber, filters.evidenceNumber)
        : undefined,
      filters?.description
        ? eq(evidenceTable.description, filters.description)
        : undefined,
      filters?.link ? eq(evidenceTable.link, filters.link) : undefined,
      filters?.uploadTimestamp
        ? eq(evidenceTable.uploadTimestamp, filters.uploadTimestamp)
        : undefined,
      filters?.type ? eq(evidenceTable.type, filters.type) : undefined,
    );
  }

  async replace(
    evidenceUniqueTrait: EvidenceUniqueTrait,
    replacementData: EvidenceReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<Evidence> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [replacedEvidence = null] = await transaction
          .update(evidenceTable)
          .set(replacementData)
          .where(
            and(
              eq(evidenceTable.activityId, evidenceUniqueTrait.activityId),
              eq(
                evidenceTable.evidenceNumber,
                evidenceUniqueTrait.evidenceNumber,
              ),
            ),
          )
          .returning();
        if (!replacedEvidence) {
          throw new EvidenceNotFoundError();
        }

        return Evidence.parse(replacedEvidence);
      },
    );
  }

  async delete(
    evidenceUniqueTrait: EvidenceUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Evidence> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [deletedEvidence = null] = await transaction
          .delete(evidenceTable)
          .where(
            and(
              eq(evidenceTable.activityId, evidenceUniqueTrait.activityId),
              eq(
                evidenceTable.evidenceNumber,
                evidenceUniqueTrait.evidenceNumber,
              ),
            ),
          )
          .returning();
        if (!deletedEvidence) {
          throw new EvidenceNotFoundError();
        }

        return Evidence.parse(deletedEvidence);
      },
    );
  }
}
