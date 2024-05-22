import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const indicatorsTable = pgTable('indicators', {
  index: integer('index').primaryKey(),
  englishName: text('english_name').notNull().unique(),
  spanishAlias: text('spanish_alias').notNull().unique(),
});
