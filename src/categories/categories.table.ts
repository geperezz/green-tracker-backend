import { pgTable, integer, text, primaryKey } from 'drizzle-orm/pg-core';

import { indicatorsTable } from 'src/indicators/indicators.table';

export const categoriesTable = pgTable(
  'categories',
  {
    indicatorIndex: integer('indicator_index')
      .notNull()
      .references(() => indicatorsTable.index, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    name: text('name').notNull(),
  },
  (categoriesTable) => {
    return {
      primaryKey: primaryKey({
        columns: [categoriesTable.indicatorIndex, categoriesTable.name],
      }),
    };
  },
);
