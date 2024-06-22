import { Inject, Injectable } from '@nestjs/common';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { IndicatorUniqueTrait } from './schemas/indicator-unique-trait.schema';
import { IndicatorUniqueTraitDto } from './dtos/indicator-unique-trait.dto';
import { IndicatorDto } from './dtos/indicator.dto';
import {
  IndicatorsRepository,
  IndicatorNotFoundError as IndicatorNotFoundRepositoryError,
} from './indicators.repository';
import { IndicatorsPageDto } from './dtos/indicators-page.dto';
import { PaginationOptionsDto } from 'src/pagination/dtos/pagination-options.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { CategoryFiltersDto } from 'src/categories/dtos/category-filters.dto';
import { IndicatorCreationDto } from './dtos/indicator-creation.dto';
import { IndicatorCreation } from './schemas/indicator-creation.schema';
import { IndicatorReplacementDto } from './dtos/indicator-replacement.dto';
import { IndicatorReplacement } from './schemas/indicator-replacement.schema';
import { CategoryIndicatorIndexDto } from 'src/categories/dtos/category-indicator-index.dto';

export abstract class IndicatorsServiceError extends Error {}
export class IndicatorNotFoundError extends IndicatorsServiceError {}

@Injectable()
export class IndicatorsService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
    private readonly indicatorsRepository: IndicatorsRepository,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    creationDataDto: IndicatorCreationDto,
    transaction?: DrizzleTransaction,
  ): Promise<IndicatorDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const indicator = await this.indicatorsRepository.create(
          IndicatorCreation.parse(creationDataDto),
          transaction,
        );

        return IndicatorDto.create({ ...indicator, categories: [] });
      },
    );
  }

  async findOne(
    indicatorUniqueTraitDto: IndicatorUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<IndicatorDto | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const indicator = await this.indicatorsRepository.findOne(
          IndicatorUniqueTrait.parse(indicatorUniqueTraitDto),
          transaction,
        );
        if (!indicator) {
          return null;
        }

        const categories = await this.categoriesService.findManyCategories(
          CategoryIndicatorIndexDto.create({
            indicatorIndex: indicator.index,
          }),
          CategoryFiltersDto.create({}),
          transaction,
        );

        return IndicatorDto.create({ ...indicator, categories });
      },
    );
  }

  async findPage(
    paginationOptionsDto: PaginationOptionsDto,
    transaction?: DrizzleTransaction,
  ): Promise<IndicatorsPageDto> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const indicatorSchemasPage = await this.indicatorsRepository.findPage(
          PaginationOptions.parse(paginationOptionsDto),
          transaction,
        );

        const indicatorDtosPage = {
          ...indicatorSchemasPage,
          items: await Promise.all(
            indicatorSchemasPage.items.map(async (indicator) => {
              const categories =
                await this.categoriesService.findManyCategories(
                  CategoryIndicatorIndexDto.create({
                    indicatorIndex: indicator.index,
                  }),
                  CategoryFiltersDto.create({}),
                  transaction,
                );
              return IndicatorDto.create({ ...indicator, categories });
            }),
          ),
        };

        return indicatorDtosPage;
      },
    );
  }

  async findAll(transaction?: DrizzleTransaction): Promise<IndicatorDto[]> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const indicatorSchemas =
          await this.indicatorsRepository.findAll(transaction);

        return await Promise.all(
          indicatorSchemas.map(async (indicator) => {
            const categories = await this.categoriesService.findManyCategories(
              CategoryIndicatorIndexDto.create({
                indicatorIndex: indicator.index,
              }),
              CategoryFiltersDto.create({}),
              transaction,
            );
            return IndicatorDto.create({ ...indicator, categories });
          }),
        );
      },
    );
  }

  async replace(
    indicatorUniqueTraitDto: IndicatorUniqueTraitDto,
    replacementDataDto: IndicatorReplacementDto,
    transaction?: DrizzleTransaction,
  ): Promise<IndicatorDto> {
    try {
      return await (transaction ?? this.drizzleClient).transaction(
        async (transaction) => {
          const newIndicatorSchema = await this.indicatorsRepository.replace(
            IndicatorUniqueTrait.parse(indicatorUniqueTraitDto),
            IndicatorReplacement.parse(replacementDataDto),
            transaction,
          );

          const categories = await this.categoriesService.findManyCategories(
            CategoryIndicatorIndexDto.create({
              indicatorIndex: newIndicatorSchema.index,
            }),
            CategoryFiltersDto.create({}),
            transaction,
          );

          return IndicatorDto.create({ ...newIndicatorSchema, categories });
        },
      );
    } catch (error) {
      if (error instanceof IndicatorNotFoundRepositoryError) {
        throw new IndicatorNotFoundError();
      }

      throw error;
    }
  }

  async delete(
    indicatorUniqueTraitDto: IndicatorUniqueTraitDto,
    transaction?: DrizzleTransaction,
  ): Promise<IndicatorDto> {
    try {
      return await (transaction ?? this.drizzleClient).transaction(
        async (transaction) => {
          const categories = await this.categoriesService.findManyCategories(
            CategoryIndicatorIndexDto.create({
              indicatorIndex: indicatorUniqueTraitDto.index,
            }),
            CategoryFiltersDto.create({}),
            transaction,
          );

          const deletedIndicatorSchema = await this.indicatorsRepository.delete(
            IndicatorUniqueTrait.parse(indicatorUniqueTraitDto),
            transaction,
          );

          return IndicatorDto.create({ ...deletedIndicatorSchema, categories });
        },
      );
    } catch (error) {
      if (error instanceof IndicatorNotFoundRepositoryError) {
        throw new IndicatorNotFoundError();
      }

      throw error;
    }
  }
}
