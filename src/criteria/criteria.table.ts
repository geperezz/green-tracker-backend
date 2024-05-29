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
    indicatorIndex: integer('index').references(() => indicatorsTable.index, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
    subindex: integer('subindex').notNull().unique(),
    englishName: text('english_name').notNull().unique(),
    spanishAlias: text('spanish_alias').notNull().unique(),
    categoryName: text('category_name').notNull(),
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
