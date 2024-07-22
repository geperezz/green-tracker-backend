import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { recommendedCategoriesTable } from './recommended-categories.table';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { RecommendedCategoryCreation } from './schemas/recommended-category-creation.schema';
import { RecommendedCategory } from './schemas/recommended-category.schema';
import { RecommendedCategoriesPage } from './schemas/recommended-categories-page.schema';
import { RecommendedCategoryReplacement } from './schemas/recommended-category-replacement.schema';
import { RecommendedCategoryUniqueTrait } from './schemas/recommended-category-unique-trait.schema';
import { RecommendedCategoryFilters } from './schemas/recommended-category-filters.schema';

export abstract class RecommendedCategoriesRepositoryError extends Error {}
export class RecommendedCategoryNotFoundError extends RecommendedCategoriesRepositoryError {}

@Injectable()
export class RecommendedCategoriesRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async create(
    creationData: RecommendedCategoryCreation,
    transaction?: DrizzleTransaction,
  ): Promise<RecommendedCategory> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [createdRecommendedCategory] = await transaction
          .insert(recommendedCategoriesTable)
          .values(creationData)
          .returning();

        return RecommendedCategory.parse(createdRecommendedCategory);
      },
    );
  }

  async createMany(
    creationData: RecommendedCategoryCreation[],
    transaction?: DrizzleTransaction,
  ): Promise<RecommendedCategory[]> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const createdRecommendedCategories = await transaction
          .insert(recommendedCategoriesTable)
          .values(creationData)
          .returning();

        return createdRecommendedCategories.map((createdRecommendedCategory) =>
          RecommendedCategory.parse(createdRecommendedCategory),
        );
      },
    );
  }

  async findOne(
    recommendedCategoryUniqueTrait: RecommendedCategoryUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<RecommendedCategory | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [foundRecommendedCategory = null] = await transaction
          .select()
          .from(recommendedCategoriesTable)
          .where(
            and(
              eq(
                recommendedCategoriesTable.indicatorIndex,
                recommendedCategoryUniqueTrait.indicatorIndex,
              ),
              eq(
                recommendedCategoriesTable.categoryName,
                recommendedCategoryUniqueTrait.categoryName,
              ),
              eq(
                recommendedCategoriesTable.unitId,
                recommendedCategoryUniqueTrait.unitId,
              ),
            ),
          );

        if (!foundRecommendedCategory) {
          return null;
        }
        return RecommendedCategory.parse(foundRecommendedCategory);
      },
    );
  }

  async findPage(
    paginationOptions: PaginationOptions,
    filters?: RecommendedCategoryFilters,
    transaction?: DrizzleTransaction,
  ): Promise<RecommendedCategoriesPage> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const filteredRecommendedCategoriesQuery = transaction
          .select()
          .from(recommendedCategoriesTable)
          .where(this.transformFiltersToWhereConditions(filters))
          .as('filtered_recommendedCategories');

        const nonValidatedRecommendedCategoriesPage = await transaction
          .select()
          .from(filteredRecommendedCategoriesQuery)
          .limit(paginationOptions.itemsPerPage)
          .offset(
            paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
          );
        const recommendedCategoriesPage =
          nonValidatedRecommendedCategoriesPage.map((recommendedCategory) =>
            RecommendedCategory.parse(recommendedCategory),
          );

        const [{ recommendedCategoriesCount }] = await transaction
          .select({
            recommendedCategoriesCount: count(
              filteredRecommendedCategoriesQuery.indicatorIndex,
            ),
          })
          .from(filteredRecommendedCategoriesQuery);

        return RecommendedCategoriesPage.parse({
          items: recommendedCategoriesPage,
          ...paginationOptions,
          pageCount: Math.ceil(
            recommendedCategoriesCount / paginationOptions.itemsPerPage,
          ),
          itemCount: recommendedCategoriesCount,
        });
      },
    );
  }

  async findAll(
    filters?: RecommendedCategoryFilters,
    transaction?: DrizzleTransaction,
  ): Promise<RecommendedCategory[]> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const nonValidatedRecommendedCategories = await transaction
          .select()
          .from(recommendedCategoriesTable)
          .where(this.transformFiltersToWhereConditions(filters));

        return nonValidatedRecommendedCategories.map((recommendedCategory) =>
          RecommendedCategory.parse(recommendedCategory),
        );
      },
    );
  }

  private transformFiltersToWhereConditions(
    filters?: RecommendedCategoryFilters,
  ) {
    return and(
      filters?.indicatorIndex !== undefined
        ? eq(recommendedCategoriesTable.indicatorIndex, filters.indicatorIndex)
        : undefined,
      filters?.categoryName !== undefined
        ? eq(recommendedCategoriesTable.categoryName, filters.categoryName)
        : undefined,
      filters?.unitId !== undefined
        ? eq(recommendedCategoriesTable.unitId, filters.unitId)
        : undefined,
    );
  }

  async replace(
    recommendedCategoryUniqueTrait: RecommendedCategoryUniqueTrait,
    replacementData: RecommendedCategoryReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<RecommendedCategory> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [replacedRecommendedCategory = null] = await transaction
          .update(recommendedCategoriesTable)
          .set(replacementData)
          .where(
            and(
              eq(
                recommendedCategoriesTable.indicatorIndex,
                recommendedCategoryUniqueTrait.indicatorIndex,
              ),
              eq(
                recommendedCategoriesTable.categoryName,
                recommendedCategoryUniqueTrait.categoryName,
              ),
              eq(
                recommendedCategoriesTable.unitId,
                recommendedCategoryUniqueTrait.unitId,
              ),
            ),
          )
          .returning();
        if (!replacedRecommendedCategory) {
          throw new RecommendedCategoryNotFoundError();
        }

        return RecommendedCategory.parse(replacedRecommendedCategory);
      },
    );
  }

  async delete(
    recommendedCategoryUniqueTrait: RecommendedCategoryUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<RecommendedCategory> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [deletedRecommendedCategory = null] = await transaction
          .delete(recommendedCategoriesTable)
          .where(
            and(
              eq(
                recommendedCategoriesTable.indicatorIndex,
                recommendedCategoryUniqueTrait.indicatorIndex,
              ),
              eq(
                recommendedCategoriesTable.categoryName,
                recommendedCategoryUniqueTrait.categoryName,
              ),
              eq(
                recommendedCategoriesTable.unitId,
                recommendedCategoryUniqueTrait.unitId,
              ),
            ),
          )
          .returning();
        if (!deletedRecommendedCategory) {
          throw new RecommendedCategoryNotFoundError();
        }

        return RecommendedCategory.parse(deletedRecommendedCategory);
      },
    );
  }

  async deleteMany(
    filters?: RecommendedCategoryFilters,
    transaction?: DrizzleTransaction,
  ): Promise<RecommendedCategory[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.deleteMany(filters, transaction);
      });
    }

    const deletedRecommendedCategories = await transaction
      .delete(recommendedCategoriesTable)
      .where(this.transformFiltersToWhereConditions(filters))
      .returning();

    return deletedRecommendedCategories.map((deletedRecommendedCategory) =>
      RecommendedCategory.parse(deletedRecommendedCategory),
    );
  }
}
