import {
  text,
  uuid,
  pgTable,
  integer,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/pg-core';

import { categoriesTable } from 'src/categories/categories.table';
import { unitsTable } from 'src/units/units.table';

export const recommendedCategoriesTable = pgTable(
  'recommended_categories',
  {
    indicatorIndex: integer('indicator_index').notNull(),
    categoryName: text('category_name').notNull(),
    unitId: uuid('unit_id')
      .references(() => unitsTable.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      })
      .notNull(),
  },
  (recommendedCategoriesTable) => {
    return {
      primaryKey: primaryKey({
        columns: [
          recommendedCategoriesTable.indicatorIndex,
          recommendedCategoriesTable.categoryName,
          recommendedCategoriesTable.unitId,
        ],
      }),
      categoryForeignKey: foreignKey({
        columns: [
          recommendedCategoriesTable.indicatorIndex,
          recommendedCategoriesTable.categoryName,
        ],
        foreignColumns: [categoriesTable.indicatorIndex, categoriesTable.name],
      })
        .onUpdate('cascade')
        .onDelete('cascade'),
    };
  },
);
