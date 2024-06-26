import { Inject, Injectable } from '@nestjs/common';
import { SQL, and, count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { criteriaTable } from './criteria.table';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { CriterionCreation } from './schemas/criterion-creation.schema';
import { Criterion } from './schemas/criterion.schema';
import { CriteriaPage } from './schemas/criteria-page.schema';
import { CriterionReplacement } from './schemas/criterion-replacement.schema';
import { CriterionUniqueTrait } from './schemas/criterion-unique-trait.schema';
import { CriterionFilters } from './schemas/criterion-filters.schema';
import { CriterionUpdate } from './schemas/criterion-update.schema';

export abstract class CriteriaRepositoryError extends Error {}
export class CriterionNotFoundError extends CriteriaRepositoryError {}

@Injectable()
export class CriteriaRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async createCriterion(
    creationData: CriterionCreation,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.createCriterion(creationData, transaction);
      });
    }

    const [createdCriterion] = await transaction
      .insert(criteriaTable)
      .values(creationData)
      .returning();

    return Criterion.parse(createdCriterion);
  }

  async findCriterion(
    uniqueTrait: CriterionUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion | null> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findCriterion(uniqueTrait, transaction);
      });
    }
    const [foundCriterion = null] = await transaction
      .select()
      .from(criteriaTable)
      .where(this.transformUniqueTraitToWhereConditions(uniqueTrait));

    if (!foundCriterion) {
      return null;
    }
    return Criterion.parse(foundCriterion);
  }

  async findCriteriaPage(
    paginationOptions: PaginationOptions,
    filters?: CriterionFilters,
    transaction?: DrizzleTransaction,
  ): Promise<CriteriaPage> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findCriteriaPage(
          paginationOptions,
          filters,
          transaction,
        );
      });
    }

    const filteredCriteriaQuery = transaction
      .select()
      .from(criteriaTable)
      .where(this.transformFiltersToWhereConditions(filters))
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
  }

  async findManyCriteria(
    filters?: CriterionFilters,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findManyCriteria(filters, transaction);
      });
    }

    const nonValidatedEvidence = await transaction
      .select()
      .from(criteriaTable)
      .where(this.transformFiltersToWhereConditions(filters));

    return nonValidatedEvidence.map((criterion) => Criterion.parse(criterion));
  }

  private transformFiltersToWhereConditions(
    filters?: CriterionFilters,
  ): SQL | undefined {
    return and(
      filters?.indicatorIndex
        ? eq(criteriaTable.indicatorIndex, filters.indicatorIndex)
        : undefined,
      filters?.subindex
        ? eq(criteriaTable.subindex, filters.subindex)
        : undefined,
      filters?.englishName
        ? eq(criteriaTable.englishName, filters.englishName)
        : undefined,
      filters?.spanishAlias
        ? eq(criteriaTable.spanishAlias, filters.spanishAlias)
        : undefined,
      filters?.categoryName
        ? eq(criteriaTable.categoryName, filters.categoryName)
        : undefined,
    );
  }

  async updateCriterion(
    uniqueTrait: CriterionUniqueTrait,
    updateData: CriterionUpdate,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.updateCriterion(uniqueTrait, updateData, transaction);
      });
    }

    const [updatedCriterion = null] = await transaction
      .update(criteriaTable)
      .set(updateData)
      .where(this.transformUniqueTraitToWhereConditions(uniqueTrait))
      .returning();
    if (!updatedCriterion) {
      throw new CriterionNotFoundError();
    }

    return Criterion.parse(updatedCriterion);
  }

  async replaceCriterion(
    uniqueTrait: CriterionUniqueTrait,
    replacementData: CriterionReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    return await this.updateCriterion(
      uniqueTrait,
      CriterionUpdate.parse(replacementData),
      transaction,
    );
  }

  async deleteCriterion(
    uniqueTrait: CriterionUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.deleteCriterion(uniqueTrait, transaction);
      });
    }

    const [deletedCriterion = null] = await transaction
      .delete(criteriaTable)
      .where(this.transformUniqueTraitToWhereConditions(uniqueTrait))
      .returning();
    if (!deletedCriterion) {
      throw new CriterionNotFoundError();
    }

    return Criterion.parse(deletedCriterion);
  }

  private transformUniqueTraitToWhereConditions(
    uniqueTrait: CriterionUniqueTrait,
  ): SQL | undefined {
    return and(
      eq(criteriaTable.indicatorIndex, uniqueTrait.indicatorIndex),
      eq(criteriaTable.subindex, uniqueTrait.subindex),
    );
  }
}
