import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

export const uploadPeriodTable = pgTable('upload_period', {
  id: uuid('id').primaryKey(),
  startTimestamp: timestamp('start_timestamp').notNull(),
  endTimestamp: timestamp('end_timestamp').notNull(),
});
