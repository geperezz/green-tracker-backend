import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';

import { DrizzleClient, DrizzleTransaction } from 'src/drizzle/drizzle.client';
import { activitiesTable } from './activities.table';
import { PaginationOptions } from 'src/pagination/schemas/pagination-options.schema';
import { ActivityCreation } from './schemas/activity-creation.schema';
import { Activity } from './schemas/activity.schema';
import { ActivitiesPage } from './schemas/activities-page.schema';
import { ActivityReplacement } from './schemas/activity-replacement.schema';
import { ActivityUniqueTrait } from './schemas/activity-unique-trait.schema';
import { ActivityFilters } from './schemas/activity-filters.schema';

export abstract class ActivitiesRepositoryError extends Error {}
export class ActivityNotFoundError extends ActivitiesRepositoryError {}

@Injectable()
export class ActivitiesRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly drizzleClient: DrizzleClient,
  ) {}

  async create(
    creationData: ActivityCreation,
    transaction?: DrizzleTransaction,
  ): Promise<Activity> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [createdActivity] = await transaction
          .insert(activitiesTable)
          .values(creationData)
          .returning();

        return Activity.parse(createdActivity);
      },
    );
  }

  async findOne(
    activityUniqueTrait: ActivityUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Activity | null> {
    console.log(activityUniqueTrait);
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [foundActivity = null] = await transaction
          .select()
          .from(activitiesTable)
          .where(eq(activitiesTable.id, activityUniqueTrait.id));

        if (!foundActivity) {
          return null;
        }
        return Activity.parse(foundActivity);
      },
    );
  }

  async findPage(
    paginationOptions: PaginationOptions,
    filters?: ActivityFilters,
    transaction?: DrizzleTransaction,
  ): Promise<ActivitiesPage> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const filteredActivitiesQuery = transaction
          .select()
          .from(activitiesTable)
          .where(this.transformFiltersToWhereConditions(filters))
          .as('filtered_activities');

        const nonValidatedActivitiesPage = await transaction
          .select()
          .from(filteredActivitiesQuery)
          .limit(paginationOptions.itemsPerPage)
          .offset(
            paginationOptions.itemsPerPage * (paginationOptions.pageIndex - 1),
          );
        const activitiesPage = nonValidatedActivitiesPage.map((activity) =>
          Activity.parse(activity),
        );

        const [{ activitiesCount }] = await transaction
          .select({
            activitiesCount: count(filteredActivitiesQuery.id),
          })
          .from(filteredActivitiesQuery);

        return ActivitiesPage.parse({
          items: activitiesPage,
          ...paginationOptions,
          pageCount: Math.ceil(
            activitiesCount / paginationOptions.itemsPerPage,
          ),
          itemCount: activitiesCount,
        });
      },
    );
  }

  private transformFiltersToWhereConditions(filters?: ActivityFilters) {
    return and(
      filters?.id ? eq(activitiesTable.id, filters.id) : undefined,
      filters?.name ? eq(activitiesTable.name, filters.name) : undefined,
      filters?.summary
        ? eq(activitiesTable.summary, filters.summary)
        : undefined,
      filters?.uploadTimestamp
        ? eq(activitiesTable.uploadTimestamp, filters.uploadTimestamp)
        : undefined,
      filters?.unitId ? eq(activitiesTable.unitId, filters.unitId) : undefined,
      filters?.indicatorIndex
        ? eq(activitiesTable.indicatorIndex, filters.indicatorIndex)
        : undefined,
      filters?.categoryName
        ? eq(activitiesTable.categoryName, filters.categoryName)
        : undefined,
    );
  }

  async replace(
    activityUniqueTrait: ActivityUniqueTrait,
    replacementData: ActivityReplacement,
    transaction?: DrizzleTransaction,
  ): Promise<Activity> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [replacedActivity = null] = await transaction
          .update(activitiesTable)
          .set(replacementData)
          .where(eq(activitiesTable.id, activityUniqueTrait.id))
          .returning();
        if (!replacedActivity) {
          throw new ActivityNotFoundError();
        }

        return Activity.parse(replacedActivity);
      },
    );
  }

  async delete(
    activityUniqueTrait: ActivityUniqueTrait,
    transaction?: DrizzleTransaction,
  ): Promise<Activity> {
    return await (transaction ?? this.drizzleClient).transaction(
      async (transaction) => {
        const [deletedActivity = null] = await transaction
          .delete(activitiesTable)
          .where(eq(activitiesTable.id, activityUniqueTrait.id))
          .returning();
        if (!deletedActivity) {
          throw new ActivityNotFoundError();
        }

        return Activity.parse(deletedActivity);
      },
    );
  }
}
