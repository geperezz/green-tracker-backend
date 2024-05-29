import {
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { activitiesTable } from 'src/activities/activities.table';

export const evidenceType = pgEnum('evidence_type', [
  'image',
  'document',
  'link',
]);

export const evidenceTable = pgTable(
  'evidence',
  {
    activityId: uuid('activity_id')
      .references(() => activitiesTable.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      })
      .notNull(),
    evidenceNumber: serial('evidence_number').notNull(),
    link: text('link').notNull(),
    description: text('description').notNull(),
    uploadTimestamp: timestamp('upload_timestamp').notNull(),
    type: evidenceType('type').notNull(),
  },
  (evidenceTable) => {
    return {
      primaryKey: primaryKey({
        columns: [evidenceTable.activityId, evidenceTable.evidenceNumber],
      }),
    };
  },
);
