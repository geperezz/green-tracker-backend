import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { criteriaTable } from './criteria.table';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { CriterionCreation } from './schemas/criterion-creation.schema';
import { Criterion } from './schemas/criterion.schema';
import { CriteriaPage } from './schemas/criteria-page.schema';
import { CriterionReplacement } from './schemas/criterion-replacement.schema';
import { CriterionUniqueTrait } from './schemas/criterion-unique-trait.schema';
import { CriterionIndicatorIndex } from './schemas/criterion-indicator-index.schema';
import { CriterionCreationPath } from './schemas/criterion-creation-path.schema';
import { CriteriaFilters } from './schemas/criteria-filters.schema';

export abstract class CriteriaRepositoryError extends Error {}
export class CriterionNotFoundError extends CriteriaRepositoryError {}

@Injectable()
export class CriteriaRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async create(
    creationData: CriterionCreation,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [createdCriterion] = await transaction
          .insert(criteriaTable)
          .values(creationData)
          .returning();

        return Criterion.parse(createdCriterion);
      },
    );
  }

  async findOne(
    criterionUniqueTrait: CriterionUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [foundCriterion = null] = await transaction
          .select()
          .from(criteriaTable)
          .where(
            and(
              eq(
                criteriaTable.indicatorIndex,
                criterionUniqueTrait.indicatorIndex,
              ),
              eq(criteriaTable.subindex, criterionUniqueTrait.subindex),
            ),
          );

        if (!foundCriterion) {
          return null;
        }
        return Criterion.parse(foundCriterion);
      },
    );
  }

  async findAll(
    filters?: CriteriaFilters,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion[]> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const nonValidatedEvidence = await transaction
          .select()
          .from(criteriaTable)
          .where(this.transformFiltersToWhereConditions(filters));

        return nonValidatedEvidence.map((evidence) =>
          Criterion.parse(evidence),
        );
      },
    );
  }

  private transformFiltersToWhereConditions(filters?: CriteriaFilters) {
    return and(
      filters?.categoryName
        ? eq(criteriaTable.categoryName, filters.categoryName)
        : undefined,
    );
  }

  async findPage(
    indicatorIndex: CriterionIndicatorIndex,
    paginationOptions: PaginationOptions,
    transaction?: DrizzleTransaction,
  ): Promise<CriteriaPage> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const filteredCriteriaQuery = transaction
          .select()
          .from(criteriaTable)
          .where(
            eq(criteriaTable.indicatorIndex, indicatorIndex.indicatorIndex),
          )
          .as('filtered_criteria');

        const nonValidatedCriteriaPage = await transaction
          .select()
          .from(filteredCriteriaQuery)
          .limit(paginationOptions.itemsPerPage)
          .offset(
            paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
          );
        const criteriaPage = nonValidatedCriteriaPage.map((criterion) =>
          Criterion.parse(criterion),
        );

        const [{ criteriaCount }] = await transaction
          .select({
            criteriaCount: count(),
          })
          .from(filteredCriteriaQuery);

        return CriteriaPage.parse({
          items: criteriaPage,
          ...paginationOptions,
          pageCount: Math.ceil(criteriaCount / paginationOptions.itemsPerPage),
          itemCount: criteriaCount,
        });
      },
    );
  }

  async replace(
    criterionUniqueTrait: CriterionUniqueTrait,
    replacementData: CriterionReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [replacedCriterion = null] = await transaction
          .update(criteriaTable)
          .set(replacementData)
          .where(
            and(
              eq(
                criteriaTable.indicatorIndex,
                criterionUniqueTrait.indicatorIndex,
              ),
              eq(criteriaTable.subindex, criterionUniqueTrait.subindex),
            ),
          )
          .returning();
        if (!replacedCriterion) {
          throw new CriterionNotFoundError();
        }

        return Criterion.parse(replacedCriterion);
      },
    );
  }

  async delete(
    criterionUniqueTrait: CriterionUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [deletedCriterion = null] = await transaction
          .delete(criteriaTable)
          .where(
            and(
              eq(
                criteriaTable.indicatorIndex,
                criterionUniqueTrait.indicatorIndex,
              ),
              eq(criteriaTable.subindex, criterionUniqueTrait.subindex),
            ),
          )
          .returning();
        if (!deletedCriterion) {
          throw new CriterionNotFoundError();
        }

        return Criterion.parse(deletedCriterion);
      },
    );
  }
}
