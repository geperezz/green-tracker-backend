import { Inject, Injectable } from '@nestjs/common';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { CategoryUniqueTrait } from './schemas/category-unique-trait.schema';
import { CategoryUniqueTraitDto } from './dtos/category-unique-trait.dto';
import { CategoryDto } from './dtos/category.dto';
import {
  CategoriesRepository,
  CategoryNotFoundError as CategoryNotFoundRepositoryError,
} from './categories.repository';
import { CategoriesPageDto } from './dtos/categories-page.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { CategoryUniqueTraitDto as CriteriaCategoryUniqueTraitDto } from 'src/criteria/dtos/category-unique-trait.dto';
import { CategoryFiltersDto } from './dtos/category-filters.dto';
import { CategoryFilters } from './schemas/category-filters.schema';
import { CriteriaService } from 'src/criteria/criteria.service';

export abstract class CategoriesServiceError extends Error {}
export class CategoryNotFoundError extends CategoriesServiceError {}

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly criteriaService: CriteriaService,
  ) {}

  async findOne(
    categoryUniqueTraitDto: CategoryUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<CategoryDto | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const category = await this.categoriesRepository.findOne(
          CategoryUniqueTrait.parse(categoryUniqueTraitDto),
          transaction,
        );
        if (!category) {
          return null;
        }

        console.log("lmao")
        console.log(category.name)

        const criteria = await this.criteriaService.findAll(
          CriteriaCategoryUniqueTraitDto.create({
            categoryName: category.name,
          }),
          transaction,
        );

        console.log("criteria fuera")
        console.log(criteria)

        const a = CategoryDto.create({ ...category, criteria });
        console.log("a")
        console.log(a)

        return CategoryDto.create({ ...category, criteria });
      },
    );
  }

  async findPage(
    paginationOptionsDto: PaginationOptionsDto,
    filters?: CategoryFiltersDto,
    transaction?: DrizzleTransaction,
  ): Promise<CategoriesPageDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const categorySchemasPage = await this.categoriesRepository.findPage(
            PaginationOptions.parse(paginationOptionsDto),
            CategoryFilters.parse(filters),
          transaction,
        );

        const categoryDtosPage = {
          ...categorySchemasPage,
          items: await Promise.all(
            categorySchemasPage.items.map(async (category) => {
              const criteria = await this.criteriaService.findAll(
                CriteriaCategoryUniqueTraitDto.create({
                  categoryName: category.name,
                }),
                transaction,
              );
              return CategoryDto.create({ ...category, criteria });
            }),
          ),
        };

        return categoryDtosPage;
      },
    );
  }
}
