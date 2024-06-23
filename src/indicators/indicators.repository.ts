import { Inject, Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { indicatorsTable } from './indicators.table';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { IndicatorCreation } from './schemas/indicator-creation.schema';
import { Indicator } from './schemas/indicator.schema';
import { IndicatorsPage } from './schemas/indicators-page.schema';
import { IndicatorReplacement } from './schemas/indicator-replacement.schema';
import { IndicatorUniqueTrait } from './schemas/indicator-unique-trait.schema';

export abstract class IndicatorsRepositoryError extends Error {}
export class IndicatorNotFoundError extends IndicatorsRepositoryError {}

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
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.create(creationData, transaction);
      });
    }

    const [createdIndicator] = await transaction
      .insert(indicatorsTable)
      .values(creationData)
      .returning();

    return Indicator.parse(createdIndicator);
  }

  async findOne(
    indicatorUniqueTrait: IndicatorUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Indicator | null> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findOne(indicatorUniqueTrait, transaction);
      });
    }

    const [foundIndicator = null] = await transaction
      .select()
      .from(indicatorsTable)
      .where(eq(indicatorsTable.index, indicatorUniqueTrait.index));

    if (!foundIndicator) {
      return null;
    }
    return Indicator.parse(foundIndicator);
  }

  async findPage(
    paginationOptions: PaginationOptions,
    transaction?: DrizzleTransaction,
  ): Promise<IndicatorsPage> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findPage(paginationOptions, transaction);
      });
    }

    const indicatorsQuery = transaction
      .select()
      .from(indicatorsTable)
      .as('indicators');

    const nonValidatedIndicatorsPage = await transaction
      .select()
      .from(indicatorsQuery)
      .limit(paginationOptions.itemsPerPage)
      .offset(
        paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
      );
    const indicatorsPage = nonValidatedIndicatorsPage.map((indicator) =>
      Indicator.parse(indicator),
    );

    const [{ indicatorsCount }] = await transaction
      .select({
        indicatorsCount: count(indicatorsQuery.index),
      })
      .from(indicatorsQuery);

    return IndicatorsPage.parse({
      items: indicatorsPage,
      ...paginationOptions,
      pageCount: Math.ceil(indicatorsCount / paginationOptions.itemsPerPage),
      itemCount: indicatorsCount,
    });
  }

  async findAll(transaction?: DrizzleTransaction): Promise<Indicator[]> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.findAll(transaction);
      });
    }

    const nonValidatedIndicators = await transaction
      .select()
      .from(indicatorsTable);

    return nonValidatedIndicators.map((indicator) =>
      Indicator.parse(indicator),
    );
  }

  async replace(
    indicatorUniqueTrait: IndicatorUniqueTrait,
    replacementData: IndicatorReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<Indicator> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.replace(
          indicatorUniqueTrait,
          replacementData,
          transaction,
        );
      });
    }

    const [replacedIndicator = null] = await transaction
      .update(indicatorsTable)
      .set(replacementData)
      .where(eq(indicatorsTable.index, indicatorUniqueTrait.index))
      .returning();
    if (!replacedIndicator) {
      throw new IndicatorNotFoundError();
    }

    return Indicator.parse(replacedIndicator);
  }

  async delete(
    indicatorUniqueTrait: IndicatorUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Indicator> {
    if (transaction === undefined) {
      return await this.drizzleClient.transaction(async (transaction) => {
        return await this.delete(indicatorUniqueTrait, transaction);
      });
    }

    const [deletedIndicator = null] = await transaction
      .delete(indicatorsTable)
      .where(eq(indicatorsTable.index, indicatorUniqueTrait.index))
      .returning();
    if (!deletedIndicator) {
      throw new IndicatorNotFoundError();
    }

    return Indicator.parse(deletedIndicator);
  }
}
