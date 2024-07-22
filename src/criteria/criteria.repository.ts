import { Inject, Injectable } from '@nestjs/common';
import { SQL, and, count, eq, isNull } from 'drizzle-orm';

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
export class CriterionAlreadyExistsError extends CriteriaRepositoryError {}

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

    try {
      const [createdCriterion] = await transaction
        .insert(criteriaTable)
        .values(creationData)
        .returning();

      return Criterion.parse(createdCriterion);
    } catch (error) {
      if (error.code == '23505') {
        if (error.detail.includes('index, subindex')) {
          throw new CriterionAlreadyExistsError(
            `Ya existe un criterio con subíndice '${creationData.subindex}' para el indicador '${creationData.indicatorIndex}'`,
            { cause: error },
          );
        }
        if (error.detail.includes('spanish_alias')) {
          throw new CriterionAlreadyExistsError(
            `Ya existe un criterio con alias en español '${creationData.spanishAlias}'`,
            { cause: error },
          );
        }
        if (error.detail.includes('english_name')) {
          throw new CriterionAlreadyExistsError(
            `Ya existe un criterio con nombre en inglés '${creationData.englishName}'`,
            { cause: error },
          );
        }
      }
      throw error;
    }
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
      filters?.indicatorIndex !== undefined
        ? eq(criteriaTable.indicatorIndex, filters.indicatorIndex)
        : undefined,
      filters?.subindex !== undefined
        ? eq(criteriaTable.subindex, filters.subindex)
        : undefined,
      filters?.englishName !== undefined
        ? eq(criteriaTable.englishName, filters.englishName)
        : undefined,
      filters?.spanishAlias !== undefined
        ? eq(criteriaTable.spanishAlias, filters.spanishAlias)
        : undefined,
      filters?.categoryName !== undefined
        ? filters.categoryName === null
          ? isNull(criteriaTable.categoryName)
          : eq(criteriaTable.categoryName, filters.categoryName)
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

    try {
      const [updatedCriterion = null] = await transaction
        .update(criteriaTable)
        .set(updateData)
        .where(this.transformUniqueTraitToWhereConditions(uniqueTrait))
        .returning();
      if (!updatedCriterion) {
        throw new CriterionNotFoundError();
      }

      return Criterion.parse(updatedCriterion);
    } catch (error) {
      if (error.code == '23505') {
        if (error.detail.includes('index, subindex')) {
          throw new CriterionAlreadyExistsError(
            `Ya existe un criterio con subíndice '${updateData.subindex ?? uniqueTrait.subindex}' para el indicador '${updateData.indicatorIndex ?? uniqueTrait.indicatorIndex}'`,
            { cause: error },
          );
        }
        if (error.detail.includes('spanish_alias')) {
          throw new CriterionAlreadyExistsError(
            `Ya existe un criterio con alias en español '${updateData.spanishAlias}'`,
            { cause: error },
          );
        }
        if (error.detail.includes('english_name')) {
          throw new CriterionAlreadyExistsError(
            `Ya existe un criterio con nombre en inglés '${updateData.englishName}'`,
            { cause: error },
          );
        }
      }
      throw error;
    }
  }

  async replaceCriterion(
    uniqueTrait: CriterionUniqueTrait,
    replacementData: CriterionReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    try {
      return await this.updateCriterion(
        uniqueTrait,
        CriterionUpdate.parse(replacementData),
        transaction,
      );
    } catch (error) {
      if (error.code == '23505') {
        if (error.detail.includes('index, subindex')) {
          throw new CriterionAlreadyExistsError(
            `Ya existe un criterio con subíndice '${replacementData.subindex}' para el indicador '${replacementData.indicatorIndex}'`,
            { cause: error },
          );
        }
        if (error.detail.includes('spanish_alias')) {
          throw new CriterionAlreadyExistsError(
            `Ya existe un criterio con alias en español '${replacementData.spanishAlias}'`,
            { cause: error },
          );
        }
        if (error.detail.includes('english_name')) {
          throw new CriterionAlreadyExistsError(
            `Ya existe un criterio con nombre en inglés '${replacementData.englishName}'`,
            { cause: error },
          );
        }
      }
      throw error;
    }
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
