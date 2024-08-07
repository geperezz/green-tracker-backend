import { Inject, Injectable } from '@nestjs/common';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { CategoryUniqueTrait } from './schemas/category-unique-trait.schema';
import { CategoryUniqueTraitDto } from './dtos/category-unique-trait.dto';
import { CategoryDto } from './dtos/category.dto';
import {
  CategoriesRepository,
  CategoryAlreadyExistsError as CategoryAlreadyExistsRepositoryError,
} from './categories.repository';
import { CriterionNotFoundError as CriterionNotFoundRepositoryError } from 'src/criteria/criteria.repository';
import { CategoriesPageDto } from './dtos/categories-page.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { CategoryFiltersDto } from './dtos/category-filters.dto';
import { CriteriaRepository } from 'src/criteria/criteria.repository';
import { CriterionFilters } from 'src/criteria/schemas/criterion-filters.schema';
import { CategoryCreationDto } from './dtos/category-creation.dto';
import { CategoryCreation } from './schemas/category-creation.schema';
import { CategoryIndicatorIndexDto } from './dtos/category-indicator-index.dto';
import { CategoryFilters } from './schemas/category-filters.schema';
import { CategoryReplacementDto } from './dtos/category-replacement.dto';
import { CriterionUpdate } from 'src/criteria/schemas/criterion-update.schema';
import { CriterionUniqueTrait } from 'src/criteria/schemas/criterion-unique-trait.schema';
import { CategoryReplacement } from './schemas/category-replacement.schema';
import { Criterion } from 'src/criteria/schemas/criterion.schema';
import { Category } from './schemas/category.schema';

export abstract class CategoriesServiceError extends Error {}
export class CategoryNotFoundError extends CategoriesServiceError {}
export class CategoryAlreadyExistsError extends CategoriesServiceError {}
export class CriterionNotFoundError extends CategoriesServiceError {
  constructor(public criterionSubindex: Criterion['subindex']) {
    super();
  }
}

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly criteriaRepository: CriteriaRepository,
  ) {}

  async createCategory(
    indicatorIndexDto: CategoryIndicatorIndexDto,
    creationDataDto: CategoryCreationDto,
    transaction?: DrizzleTransaction,
  ): Promise<CategoryDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.createCategory(
          indicatorIndexDto,
          creationDataDto,
          transaction,
        );
      });
    }

    let createdCategorySchema: Category;
    try {
      createdCategorySchema = await this.categoriesRepository.createCategory(
        CategoryCreation.parse({
          ...indicatorIndexDto,
          ...creationDataDto,
        }),
        transaction,
      );
    } catch (error) {
      if (error instanceof CategoryAlreadyExistsRepositoryError) {
        throw new CategoryAlreadyExistsError(error.message, { cause: error });
      }
      throw error;
    }

    const updatedCriteriaSchema = await Promise.all(
      creationDataDto.criteria.map(async ({ subindex }) => {
        try {
          return await this.criteriaRepository.updateCriterion(
            CriterionUniqueTrait.parse({
              indicatorIndex: createdCategorySchema.indicatorIndex,
              subindex,
            }),
            CriterionUpdate.parse({
              categoryName: createdCategorySchema.name,
            }),
            transaction,
          );
        } catch (error) {
          if (error instanceof CriterionNotFoundRepositoryError) {
            throw new CriterionNotFoundError(subindex);
          }
          throw error;
        }
      }),
    );

    return CategoryDto.create({
      ...createdCategorySchema,
      criteria: updatedCriteriaSchema,
    });
  }

  async findCategory(
    uniqueTraitDto: CategoryUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<CategoryDto | null> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findCategory(uniqueTraitDto, transaction);
      });
    }

    const foundCategorySchema = await this.categoriesRepository.findCategory(
      CategoryUniqueTrait.parse(uniqueTraitDto),
      transaction,
    );
    if (!foundCategorySchema) {
      return null;
    }

    const foundCriteriaSchema = await this.criteriaRepository.findManyCriteria(
      CriterionFilters.parse({
        indicatorIndex: foundCategorySchema.indicatorIndex,
        categoryName: foundCategorySchema.name,
      }),
      transaction,
    );

    return CategoryDto.create({
      ...foundCategorySchema,
      criteria: foundCriteriaSchema,
    });
  }

  async findCategoriesPage(
    indicatorIndexDto: CategoryIndicatorIndexDto,
    paginationOptionsDto: PaginationOptionsDto,
    filters?: CategoryFiltersDto,
    transaction?: DrizzleTransaction,
  ): Promise<CategoriesPageDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findCategoriesPage(
          indicatorIndexDto,
          paginationOptionsDto,
          filters,
          transaction,
        );
      });
    }

    const categorySchemasPage =
      await this.categoriesRepository.findCategoriesPage(
        PaginationOptions.parse(paginationOptionsDto),
        CategoryFilters.parse({ ...filters, ...indicatorIndexDto }),
        transaction,
      );

    const categoryDtosPage = {
      ...categorySchemasPage,
      items: await Promise.all(
        categorySchemasPage.items.map(async (categorySchema) => {
          const foundCriteria = await this.criteriaRepository.findManyCriteria(
            CriterionFilters.parse({
              indicatorIndex: categorySchema.indicatorIndex,
              categoryName: categorySchema.name,
            }),
            transaction,
          );
          return CategoryDto.create({
            ...categorySchema,
            criteria: foundCriteria,
          });
        }),
      ),
    };

    return categoryDtosPage;
  }

  async findManyCategories(
    indicatorIndexDto: CategoryIndicatorIndexDto,
    filters?: CategoryFiltersDto,
    transaction?: DrizzleTransaction,
  ): Promise<CategoryDto[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findManyCategories(
          indicatorIndexDto,
          filters,
          transaction,
        );
      });
    }

    const categorySchemas = await this.categoriesRepository.findManyCategories(
      CategoryFilters.parse({ ...filters, ...indicatorIndexDto }),
      transaction,
    );

    return await Promise.all(
      categorySchemas.map(async (category) => {
        const foundCriteria = await this.criteriaRepository.findManyCriteria(
          CriterionFilters.parse({
            indicatorIndex: category.indicatorIndex,
            categoryName: category.name,
          }),
          transaction,
        );
        return CategoryDto.create({ ...category, criteria: foundCriteria });
      }),
    );
  }

  async replaceCategory(
    uniqueTraitDto: CategoryUniqueTraitDto,
    replacementDataDto: CategoryReplacementDto,
    transaction?: DrizzleTransaction,
  ): Promise<CategoryDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.replaceCategory(
          uniqueTraitDto,
          replacementDataDto,
          transaction,
        );
      });
    }

    const categoryToBeReplaced = await this.findCategory(
      uniqueTraitDto,
      transaction,
    );
    if (!categoryToBeReplaced) {
      throw new CategoryNotFoundError();
    }

    await Promise.all(
      categoryToBeReplaced.criteria.map(async (criterion) => {
        await this.criteriaRepository.updateCriterion(
          CriterionUniqueTrait.parse({
            indicatorIndex: uniqueTraitDto.indicatorIndex,
            subindex: criterion.subindex,
          }),
          CriterionUpdate.parse({
            categoryName: null,
          }),
          transaction,
        );
      }),
    );

    let newCategorySchema: Category;
    try {
      newCategorySchema = await this.categoriesRepository.replaceCategory(
        CategoryUniqueTrait.parse(uniqueTraitDto),
        CategoryReplacement.parse({
          ...replacementDataDto,
          indicatorIndex: uniqueTraitDto.indicatorIndex,
        }),
        transaction,
      );
    } catch (error) {
      if (error instanceof CategoryAlreadyExistsRepositoryError) {
        throw new CategoryAlreadyExistsError(error.message, { cause: error });
      }
      throw error;
    }

    const newCriteriaSchemas = await Promise.all(
      replacementDataDto.criteria.map(async ({ subindex }) => {
        try {
          return await this.criteriaRepository.updateCriterion(
            CriterionUniqueTrait.parse({
              indicatorIndex: newCategorySchema.indicatorIndex,
              subindex,
            }),
            CriterionUpdate.parse({
              categoryName: newCategorySchema.name,
            }),
            transaction,
          );
        } catch (error) {
          throw new CriterionNotFoundError(subindex);
        }
      }),
    );

    return CategoryDto.create({
      ...newCategorySchema,
      criteria: newCriteriaSchemas,
    });
  }

  async deleteCategory(
    uniqueTraitDto: CategoryUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<CategoryDto> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.deleteCategory(uniqueTraitDto, transaction);
      });
    }

    const categoryToDelete = await this.findCategory(
      uniqueTraitDto,
      transaction,
    );
    if (!categoryToDelete) {
      throw new CategoryNotFoundError();
    }

    await Promise.all(
      categoryToDelete.criteria.map(async (criterion) => {
        await this.criteriaRepository.updateCriterion(
          CriterionUniqueTrait.parse({
            indicatorIndex: uniqueTraitDto.indicatorIndex,
            subindex: criterion.subindex,
          }),
          CriterionUpdate.parse({
            categoryName: null,
          }),
          transaction,
        );
      }),
    );

    await this.categoriesRepository.deleteCategory(
      CategoryUniqueTrait.parse(uniqueTraitDto),
      transaction,
    );

    return categoryToDelete;
  }
}
