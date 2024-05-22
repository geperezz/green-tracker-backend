import { Inject, Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { indicatorsTable } from './indicators.table';
import {
  PaginationOptions,
  paginationOptionsSchema,
} from 'src/pagination/schemas/pagination-options.schema';
import {
  IndicatorCreation,
  indicatorCreationSchema,
} from './schemas/indicator-creation.schema';
import { Indicator, indicatorSchema } from './schemas/indicator.schema';
import { IndicatorsPage } from './schemas/indicators-page.schema';
import {
  IndicatorReplacement,
  indicatorReplacementSchema,
} from './schemas/indicator-replacement.schema';

export class IndicatorsRepositoryError extends Error {}
export class IndicatorNotFoundError extends IndicatorsRepositoryError {}
export class InvalidIndicatorIndexError extends IndicatorsRepositoryError {}
export class InvalidPaginationOptionsError extends IndicatorsRepositoryError {}
export class InvalidCreationDataError extends IndicatorsRepositoryError {}
export class InvalidReplacementDataError extends IndicatorsRepositoryError {}

@Injectable()
export class IndicatorsRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async create(
    creationData: IndicatorCreation,
    transaction?: DrizzleTransaction,
  ): Promise<Indicator> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        creationData = this.parseCreationData(creationData);

        const [createdIndicator] = await transaction
          .insert(indicatorsTable)
          .values(creationData)
          .returning();

        return indicatorSchema.parse(createdIndicator);
      },
    );
  }

  private parseCreationData(creationData: unknown): IndicatorCreation {
    const replacementDataParsingResult =
      indicatorCreationSchema.safeParse(creationData);
    if (!replacementDataParsingResult.success) {
      throw new InvalidCreationDataError(undefined, {
        cause: replacementDataParsingResult.error,
      });
    }
    return replacementDataParsingResult.data;
  }

  async findOne(
    indicatorIndex: Indicator['index'],
    transaction?: DrizzleTransaction,
  ): Promise<Indicator | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        indicatorIndex = this.parseIndicatorIndex(indicatorIndex);

        const [foundIndicator = null] = await transaction
          .select()
          .from(indicatorsTable)
          .where(eq(indicatorsTable.index, indicatorIndex));

        if (!foundIndicator) {
          return null;
        }
        return indicatorSchema.parse(foundIndicator);
      },
    );
  }

  async findPage(
    paginationOptions: PaginationOptions,
    transaction?: DrizzleTransaction,
  ): Promise<IndicatorsPage> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        paginationOptions = this.parsePaginationOptions(paginationOptions);

        const indicatorsPageQuery = transaction
          .select()
          .from(indicatorsTable)
          .limit(paginationOptions.itemsPerPage)
          .offset(
            paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
          )
          .as('indicators_page');

        const nonValidatedIndicatorsPage = await transaction
          .select()
          .from(indicatorsPageQuery);
        const indicatorsPage = nonValidatedIndicatorsPage.map((indicator) =>
          indicatorSchema.parse(indicator),
        );

        const [{ indicatorsCount }] = await transaction
          .select({
            indicatorsCount: count(indicatorsPageQuery.index),
          })
          .from(indicatorsPageQuery);

        return {
          items: indicatorsPage,
          ...paginationOptions,
          pageCount: Math.ceil(
            indicatorsCount / paginationOptions.itemsPerPage,
          ),
          itemCount: indicatorsCount,
        };
      },
    );
  }

  private parsePaginationOptions(
    paginationOptions: unknown,
  ): PaginationOptions {
    const paginationOptionsParsingResult =
      paginationOptionsSchema.safeParse(paginationOptions);
    if (!paginationOptionsParsingResult.success) {
      throw new InvalidPaginationOptionsError(undefined, {
        cause: paginationOptionsParsingResult.error,
      });
    }
    return paginationOptionsParsingResult.data;
  }

  async replace(
    indicatorIndex: Indicator['index'],
    replacementData: IndicatorReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<Indicator> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        indicatorIndex = this.parseIndicatorIndex(indicatorIndex);
        replacementData = this.parseReplacementData(replacementData);

        const [replacedIndicator = null] = await transaction
          .update(indicatorsTable)
          .set(replacementData)
          .returning();
        if (!replacedIndicator) {
          throw new IndicatorNotFoundError();
        }

        return indicatorSchema.parse(replacedIndicator);
      },
    );
  }

  private parseReplacementData(replacementData: unknown): IndicatorReplacement {
    const replacementDataParsingResult =
      indicatorReplacementSchema.safeParse(replacementData);
    if (!replacementDataParsingResult.success) {
      throw new InvalidReplacementDataError(undefined, {
        cause: replacementDataParsingResult.error,
      });
    }
    return replacementDataParsingResult.data;
  }

  async delete(
    indicatorIndex: Indicator['index'],
    transaction?: DrizzleTransaction,
  ): Promise<Indicator> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        indicatorIndex = this.parseIndicatorIndex(indicatorIndex);

        const [deletedIndicator = null] = await transaction
          .delete(indicatorsTable)
          .where(eq(indicatorsTable.index, indicatorIndex))
          .returning();
        if (!deletedIndicator) {
          throw new IndicatorNotFoundError();
        }

        return indicatorSchema.parse(deletedIndicator);
      },
    );
  }

  private parseIndicatorIndex(indicatorIndex: unknown): Indicator['index'] {
    const indicatorIndexParsingResult =
      indicatorSchema.shape.index.safeParse(indicatorIndex);
    if (!indicatorIndexParsingResult.success) {
      throw new InvalidIndicatorIndexError(undefined, {
        cause: indicatorIndexParsingResult.error,
      });
    }
    return indicatorIndexParsingResult.data;
  }
}
