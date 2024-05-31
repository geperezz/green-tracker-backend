import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { categoriesTable } from './categories.table';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { CategoryCreation } from './schemas/category-creation.schema';
import { Category } from './schemas/category.schema';
import { CategoriesPage } from './schemas/categories-page.schema';
import { CategoryReplacement } from './schemas/category-replacement.schema';
import { CategoryUniqueTrait } from './schemas/category-unique-trait.schema';

export abstract class CategoriesRepositoryError extends Error {}
export class CategoryNotFoundError extends CategoriesRepositoryError {}

@Injectable()
export class CategoriesRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async create(
    creationData: CategoryCreation,
    transaction?: DrizzleTransaction,
  ): Promise<Category> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [createdCategory] = await transaction
          .insert(categoriesTable)
          .values(creationData)
          .returning();

        return Category.parse(createdCategory);
      },
    );
  }

  async findOne(
    categoryUniqueTrait: CategoryUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Category | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [foundCategory = null] = await transaction
          .select()
          .from(categoriesTable)
          .where(
            and(
              eq(
                categoriesTable.indicatorIndex,
                categoryUniqueTrait.indicatorIndex,
              ),
              eq(categoriesTable.name, categoryUniqueTrait.name),
            ),
          );

        if (!foundCategory) {
          return null;
        }
        return Category.parse(foundCategory);
      },
    );
  }

  async findPage(
    paginationOptions: PaginationOptions,
    transaction?: DrizzleTransaction,
  ): Promise<CategoriesPage> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const categoriesPageQuery = transaction
          .select()
          .from(categoriesTable)
          .limit(paginationOptions.itemsPerPage)
          .offset(
            paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
          )
          .as('categories_page');

        const nonValidatedCategoriesPage = await transaction
          .select()
          .from(categoriesPageQuery);
        const categoriesPage = nonValidatedCategoriesPage.map((category) =>
          Category.parse(category),
        );

        const [{ categoriesCount }] = await transaction
          .select({
            categoriesCount: count(categoriesPageQuery.indicatorIndex),
          })
          .from(categoriesPageQuery);

        return CategoriesPage.parse({
          items: categoriesPage,
          ...paginationOptions,
          pageCount: Math.ceil(
            categoriesCount / paginationOptions.itemsPerPage,
          ),
          itemCount: categoriesCount,
        });
      },
    );
  }

  async replace(
    categoryUniqueTrait: CategoryUniqueTrait,
    replacementData: CategoryReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<Category> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [replacedCategory = null] = await transaction
          .update(categoriesTable)
          .set(replacementData)
          .where(
            and(
              eq(
                categoriesTable.indicatorIndex,
                categoryUniqueTrait.indicatorIndex,
              ),
              eq(categoriesTable.name, categoryUniqueTrait.name),
            ),
          )
          .returning();
        if (!replacedCategory) {
          throw new CategoryNotFoundError();
        }

        return Category.parse(replacedCategory);
      },
    );
  }

  async delete(
    categoryUniqueTrait: CategoryUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Category> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [deletedCategory = null] = await transaction
          .delete(categoriesTable)
          .where(
            and(
              eq(
                categoriesTable.indicatorIndex,
                categoryUniqueTrait.indicatorIndex,
              ),
              eq(categoriesTable.name, categoryUniqueTrait.name),
            ),
          )
          .returning();
        if (!deletedCategory) {
          throw new CategoryNotFoundError();
        }

        return Category.parse(deletedCategory);
      },
    );
  }
}
