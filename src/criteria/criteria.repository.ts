import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { criteriaTable } from './criteria.table';
import {
  PaginationOptions,
  paginationOptionsSchema,
} from 'src/pagination/schemas/pagination-options.schema';
import {
  CriterionCreation,
  criterionCreationSchema,
} from './schemas/criterion-creation.schema';
import { Criterion, criterionSchema } from './schemas/criterion.schema';
import { CriteriaPage } from './schemas/criteria-page.schema';
import {
  CriterionReplacement,
  criterionReplacementSchema,
} from './schemas/criterion-replacement.schema';

export class CriteriaRepositoryError extends Error {}
export class CriterionNotFoundError extends CriteriaRepositoryError {}
export class InvalidCriterionIndexError extends CriteriaRepositoryError {}
export class InvalidCriterionForeignKeyError extends CriteriaRepositoryError {}
export class InvalidPaginationOptionsError extends CriteriaRepositoryError {}
export class InvalidCreationDataError extends CriteriaRepositoryError {}
export class InvalidReplacementDataError extends CriteriaRepositoryError {}

@Injectable()
export class CriteriaRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async create(
    creationData: CriterionCreation,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        creationData = this.parseCreationData(creationData);

        const [createdCriterion] = await transaction
          .insert(criteriaTable)
          .values(creationData)
          .returning();

        return criterionSchema.parse(createdCriterion);
      },
    );
  }

  private parseCreationData(creationData: unknown): CriterionCreation {
    const replacementDataParsingResult =
      criterionCreationSchema.safeParse(creationData);
    if (!replacementDataParsingResult.success) {
      throw new InvalidCreationDataError(undefined, {
        cause: replacementDataParsingResult.error,
      });
    }
    return replacementDataParsingResult.data;
  }

  async findOne(
    indicatorIndex: Criterion['indicatorIndex'],
    subindex: Criterion['subindex'],
    transaction?: DrizzleTransaction,
  ): Promise<Criterion | null> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        indicatorIndex = this.parseIndicatorIndex(indicatorIndex);
        subindex = this.parseCriterionSubindex(subindex);

        const [foundCriterion = null] = await transaction
          .select()
          .from(criteriaTable)
          .where(
            and(
              eq(criteriaTable.indicatorIndex, indicatorIndex),
              eq(criteriaTable.subindex, subindex),
            ),
          );

        if (!foundCriterion) {
          return null;
        }
        return criterionSchema.parse(foundCriterion);
      },
    );
  }

  async findPage(
    paginationOptions: PaginationOptions,
    transaction?: DrizzleTransaction,
  ): Promise<CriteriaPage> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        paginationOptions = this.parsePaginationOptions(paginationOptions);

        const criteriaPageQuery = transaction
          .select()
          .from(criteriaTable)
          .limit(paginationOptions.itemsPerPage)
          .offset(
            paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
          )
          .as('criteria_page');

        const nonValidatedCriteriaPage = await transaction
          .select()
          .from(criteriaPageQuery);
        const criteriaPage = nonValidatedCriteriaPage.map((criterion) =>
          criterionSchema.parse(criterion),
        );

        const [{ criteriaCount }] = await transaction
          .select({
            criteriaCount: count(),
          })
          .from(criteriaPageQuery);

        return {
          items: criteriaPage,
          ...paginationOptions,
          pageCount: Math.ceil(criteriaCount / paginationOptions.itemsPerPage),
          itemCount: criteriaCount,
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
    indicatorIndex: Criterion['indicatorIndex'],
    subindex: Criterion['subindex'],
    replacementData: CriterionReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        indicatorIndex = this.parseIndicatorIndex(indicatorIndex);
        subindex = this.parseCriterionSubindex(subindex);
        replacementData = this.parseReplacementData(replacementData);

        const [replacedCriterion = null] = await transaction
          .update(criteriaTable)
          .set(replacementData)
          .where(
            and(
              eq(criteriaTable.indicatorIndex, indicatorIndex),
              eq(criteriaTable.subindex, subindex),
            ),
          )
          .returning();
        if (!replacedCriterion) {
          throw new CriterionNotFoundError();
        }

        return criterionSchema.parse(replacedCriterion);
      },
    );
  }

  private parseReplacementData(replacementData: unknown): CriterionReplacement {
    const replacementDataParsingResult =
      criterionReplacementSchema.safeParse(replacementData);
    if (!replacementDataParsingResult.success) {
      throw new InvalidReplacementDataError(undefined, {
        cause: replacementDataParsingResult.error,
      });
    }
    return replacementDataParsingResult.data;
  }

  async delete(
    indicatorIndex: Criterion['indicatorIndex'],
    subindex: Criterion['subindex'],
    transaction?: DrizzleTransaction,
  ): Promise<Criterion> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        indicatorIndex = this.parseIndicatorIndex(indicatorIndex);
        subindex = this.parseCriterionSubindex(subindex);

        const [deletedCriterion = null] = await transaction
          .delete(criteriaTable)
          .where(
            and(
              eq(criteriaTable.indicatorIndex, indicatorIndex),
              eq(criteriaTable.subindex, subindex),
            ),
          )
          .returning();
        if (!deletedCriterion) {
          throw new CriterionNotFoundError();
        }

        return criterionSchema.parse(deletedCriterion);
      },
    );
  }

  private parseIndicatorIndex(indicatorIndex: unknown): Criterion['indicatorIndex'] {
    const indicatorIndexParsingResult =
      criterionSchema.shape.indicatorIndex.safeParse(indicatorIndex);
    if (!indicatorIndexParsingResult.success) {
      throw new InvalidCriterionIndexError(undefined, {
        cause: indicatorIndexParsingResult.error,
      });
    }
    return indicatorIndexParsingResult.data;
  }

  private parseCriterionSubindex(criterionSubindex: unknown): Criterion['subindex'] {
    const criterionSubindexParsingResult =
      criterionSchema.shape.subindex.safeParse(criterionSubindex);
    if (!criterionSubindexParsingResult.success) {
      throw new InvalidCriterionIndexError(undefined, {
        cause: criterionSubindexParsingResult.error,
      });
    }
    return criterionSubindexParsingResult.data;
  }
}
