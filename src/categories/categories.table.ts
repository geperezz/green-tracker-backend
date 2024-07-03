import { sql } from 'drizzle-orm';
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
    helpText: text('help_text').notNull(),
  },
  (categoriesTable) => {
    return {
      primaryKey: primaryKey({
        columns: [categoriesTable.indicatorIndex, categoriesTable.name],
      }),
    };
  },
);
