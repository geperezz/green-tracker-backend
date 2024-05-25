import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { indicatorsTable } from 'src/indicators/indicators.table';

export const criteriaTable = pgTable(
  'criteria',
  {
    indicatorIndex: integer('index').references(() => indicatorsTable.index),
    subindex: integer('subindex').notNull().unique(),
    englishName: text('english_name').notNull().unique(),
    spanishAlias: text('spanish_alias').notNull().unique(),
    categoryName: text('category_name').notNull(),
  },
  (criteria) => {
    return {
      primaryKey: primaryKey({
        columns: [criteria.indicatorIndex, criteria.subindex],
      }),
      englishNameIndex: uniqueIndex('indicators_english_name_idx').on(
        criteria.indicatorIndex,
        criteria.englishName,
      ),
      spanishAliasIndex: uniqueIndex('indicators_spanish_alias_idx').on(
        criteria.indicatorIndex,
        criteria.spanishAlias,
      ),
    };
  },
);

export const criteriaRelations = relations(criteriaTable, ({ one }) => ({
  indicator: one(indicatorsTable, {
    fields: [criteriaTable.indicatorIndex],
    references: [indicatorsTable.index],
  }),
}));
