import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  foreignKey,
} from 'drizzle-orm/pg-core';

import { categoriesTable } from 'src/categories/categories.table';
import { usersTable } from 'src/users/users.table';

export const activitiesTable = pgTable(
  'activities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    summary: text('summary').notNull(),
    indicatorIndex: integer('indicator_index').notNull(),
    categoryName: text('category_name').notNull(),
    unitId: uuid('unit_id')
      .references(() => usersTable.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      })
      .notNull(),
    uploadTimestamp: timestamp('upload_timestamp').notNull(),
  },
  (activitiesTable) => {
    return {
      categoryForeignKey: foreignKey({
        columns: [activitiesTable.indicatorIndex, activitiesTable.categoryName],
        foreignColumns: [categoriesTable.indicatorIndex, categoriesTable.name],
      })
        .onUpdate('cascade')
        .onDelete('restrict'),
    };
  },
);
