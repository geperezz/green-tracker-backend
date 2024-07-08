import { foreignKey } from 'drizzle-orm/pg-core';
import {
  integer,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { categoriesTable } from 'src/categories/categories.table';
import { indicatorsTable } from 'src/indicators/indicators.table';

export const criteriaTable = pgTable(
  'criteria',
  {
    indicatorIndex: integer('index')
      .notNull()
      .references(() => indicatorsTable.index, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    subindex: integer('subindex').notNull(),
    englishName: text('english_name').notNull(),
    spanishAlias: text('spanish_alias').notNull(),
    categoryName: text('category_name'),
  },
  (criteriaTable) => {
    return {
      primaryKey: primaryKey({
        columns: [criteriaTable.indicatorIndex, criteriaTable.subindex],
      }),
      englishNameIndex: uniqueIndex().on(
        criteriaTable.indicatorIndex,
        criteriaTable.englishName,
      ),
      spanishAliasIndex: uniqueIndex().on(
        criteriaTable.indicatorIndex,
        criteriaTable.spanishAlias,
      ),
      categoryForeignKey: foreignKey({
        columns: [criteriaTable.indicatorIndex, criteriaTable.categoryName],
        foreignColumns: [categoriesTable.indicatorIndex, categoriesTable.name],
      })
        .onUpdate('cascade')
        .onDelete('restrict'),
    };
  },
);
