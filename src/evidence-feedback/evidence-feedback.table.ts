import { pgEnum } from 'drizzle-orm/pg-core';
import {
  foreignKey,
  pgTable,
  primaryKey,
  serial,
  text,
  uuid,
} from 'drizzle-orm/pg-core';

import { evidenceTable } from 'src/evidence/evidence.table';
import { usersTable } from 'src/users/users.table';

export const feedbackType = pgEnum('feedback_type', [
  'approved',
  'contact_admin',
  'broken_link',
  'broken_file',
]);

export const evidenceFeedbackTable = pgTable(
  'evidence_feedback',
  {
    activityId: uuid('activity_id').notNull(),
    evidenceNumber: serial('evidence_number').notNull(),
    adminId: uuid('admin_id')
      .references(() => usersTable.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      })
      .notNull(),
    feedback: feedbackType('feedback').notNull(),
  },
  (evidenceFeedbackTable) => {
    return {
      primaryKey: primaryKey({
        columns: [
          evidenceFeedbackTable.activityId,
          evidenceFeedbackTable.evidenceNumber,
          evidenceFeedbackTable.feedback,
        ],
      }),
      evidenceForeignKey: foreignKey({
        columns: [
          evidenceFeedbackTable.activityId,
          evidenceFeedbackTable.evidenceNumber,
        ],
        foreignColumns: [
          evidenceTable.activityId,
          evidenceTable.evidenceNumber,
        ],
      })
        .onUpdate('cascade')
        .onDelete('cascade'),
    };
  },
);
