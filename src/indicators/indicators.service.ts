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

        const categories = await this.categoriesService.findAll(
          CategoryFiltersDto.create({ indicatorIndex: indicator.index }),
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
              const categories = await this.categoriesService.findAll(
                CategoryFiltersDto.create({ indicatorIndex: indicator.index }),
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
            const categories = await this.categoriesService.findAll(
              CategoryFiltersDto.create({ indicatorIndex: indicator.index }),
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
  ): Promise<IndicatorDto> {
    try {
      const newIndicatorSchema = await this.indicatorsRepository.replace(
        IndicatorUniqueTrait.parse(indicatorUniqueTraitDto),
        IndicatorReplacement.parse(replacementDataDto),
      );

      return IndicatorDto.create(newIndicatorSchema);
    } catch (error) {
      if (error instanceof IndicatorNotFoundRepositoryError) {
        throw new IndicatorNotFoundError();
      }

      throw error;
    }
  }

  async delete(
    indicatorUniqueTraitDto: IndicatorUniqueTraitDto,
  ): Promise<IndicatorDto> {
    try {
      const deletedIndicatorSchema = await this.indicatorsRepository.delete(
        IndicatorUniqueTrait.parse(indicatorUniqueTraitDto),
      );

      return IndicatorDto.create(deletedIndicatorSchema);
    } catch (error) {
      if (error instanceof IndicatorNotFoundRepositoryError) {
        throw new IndicatorNotFoundError();
      }

      throw error;
    }
  }
}
