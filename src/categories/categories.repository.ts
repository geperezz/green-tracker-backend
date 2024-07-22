import { Inject, Injectable } from '@nestjs/common';
import { SQL, and, count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { categoriesTable } from './categories.table';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { CategoryCreation } from './schemas/category-creation.schema';
import { Category } from './schemas/category.schema';
import { CategoriesPage } from './schemas/categories-page.schema';
import { CategoryReplacement } from './schemas/category-replacement.schema';
import { CategoryUniqueTrait } from './schemas/category-unique-trait.schema';
import { CategoryFilters } from './schemas/category-filters.schema';

export abstract class CategoriesRepositoryError extends Error {}
export class CategoryNotFoundError extends CategoriesRepositoryError {}
export class CategoryAlreadyExistsError extends CategoriesRepositoryError {}

@Injectable()
export class CategoriesRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async createCategory(
    creationData: CategoryCreation,
    transaction?: DrizzleTransaction,
  ): Promise<Category> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.createCategory(creationData, transaction);
      });
    }

    try {
      const [createdCategory] = await transaction
        .insert(categoriesTable)
        .values(creationData)
        .returning();

      return Category.parse(createdCategory);
    } catch (error) {
      if (error.code == '23505') {
        if (error.detail.includes('name')) {
          throw new CategoryAlreadyExistsError(
            `Ya existe una categoría con nombre '${creationData.name}' para el indicador '${creationData.indicatorIndex}'`,
            { cause: error },
          );
        }
      }
      throw error;
    }
  }

  async findCategory(
    uniqueTrait: CategoryUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Category | null> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findCategory(uniqueTrait, transaction);
      });
    }

    const [foundCategory = null] = await transaction
      .select()
      .from(categoriesTable)
      .where(this.transformUniqueTraitToWhereConditions(uniqueTrait));

    if (!foundCategory) {
      return null;
    }
    return Category.parse(foundCategory);
  }

  async findCategoriesPage(
    paginationOptions: PaginationOptions,
    filters?: CategoryFilters,
    transaction?: DrizzleTransaction,
  ): Promise<CategoriesPage> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findCategoriesPage(
          paginationOptions,
          filters,
          transaction,
        );
      });
    }

    const filteredCategoriesQuery = transaction
      .select()
      .from(categoriesTable)
      .where(this.transformFiltersToWhereConditions(filters))
      .as('filtered_categories');

    const nonValidatedCategoriesPage = await transaction
      .select()
      .from(filteredCategoriesQuery)
      .limit(paginationOptions.itemsPerPage)
      .offset(
        paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
      );
    const categoriesPage = nonValidatedCategoriesPage.map((category) =>
      Category.parse(category),
    );

    const [{ categoriesCount }] = await transaction
      .select({
        categoriesCount: count(filteredCategoriesQuery.indicatorIndex),
      })
      .from(filteredCategoriesQuery);

    return CategoriesPage.parse({
      items: categoriesPage,
      ...paginationOptions,
      pageCount: Math.ceil(categoriesCount / paginationOptions.itemsPerPage),
      itemCount: categoriesCount,
    });
  }

  async findManyCategories(
    filters?: CategoryFilters,
    transaction?: DrizzleTransaction,
  ): Promise<Category[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findManyCategories(filters, transaction);
      });
    }

    const nonValidatedCategories = await transaction
      .select()
      .from(categoriesTable)
      .where(this.transformFiltersToWhereConditions(filters));

    return nonValidatedCategories.map((category) => Category.parse(category));
  }

  private transformFiltersToWhereConditions(
    filters?: CategoryFilters,
  ): SQL | undefined {
    return and(
      filters?.indicatorIndex !== undefined
        ? eq(categoriesTable.indicatorIndex, filters.indicatorIndex)
        : undefined,
      filters?.name !== undefined
        ? eq(categoriesTable.name, filters.name)
        : undefined,
    );
  }

  async replaceCategory(
    uniqueTrait: CategoryUniqueTrait,
    replacementData: CategoryReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<Category> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.replaceCategory(
          uniqueTrait,
          replacementData,
          transaction,
        );
      });
    }

    try {
      const [replacedCategory = null] = await transaction
        .update(categoriesTable)
        .set(replacementData)
        .where(this.transformUniqueTraitToWhereConditions(uniqueTrait))
        .returning();
      if (!replacedCategory) {
        throw new CategoryNotFoundError();
      }

      return Category.parse(replacedCategory);
    } catch (error) {
      if (error.code == '23505') {
        if (error.detail.includes('name')) {
          throw new CategoryAlreadyExistsError(
            `Ya existe una categoría con nombre '${replacementData.name}' para el indicador '${replacementData.indicatorIndex}'`,
            { cause: error },
          );
        }
      }
      throw error;
    }
  }

  async deleteCategory(
    uniqueTrait: CategoryUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Category> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.deleteCategory(uniqueTrait, transaction);
      });
    }

    const [deletedCategory = null] = await transaction
      .delete(categoriesTable)
      .where(this.transformUniqueTraitToWhereConditions(uniqueTrait))
      .returning();
    if (!deletedCategory) {
      throw new CategoryNotFoundError();
    }

    return Category.parse(deletedCategory);
  }

  private transformUniqueTraitToWhereConditions(
    uniqueTrait: CategoryUniqueTrait,
  ): SQL | undefined {
    return and(
      eq(categoriesTable.indicatorIndex, uniqueTrait.indicatorIndex),
      eq(categoriesTable.name, uniqueTrait.name),
    );
  }
}
