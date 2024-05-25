import { relations } from 'drizzle-orm';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { criteriaTable } from 'src/criteria/criteria.table';

export const indicatorsTable = pgTable('indicators', {
  index: integer('index').primaryKey(),
  englishName: text('english_name').notNull().unique(),
  spanishAlias: text('spanish_alias').notNull().unique(),
});

export const indicatorsRelations = relations(indicatorsTable, ({ many }) => ({
  criteria: many(criteriaTable),
}));