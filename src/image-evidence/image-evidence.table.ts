import {
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  text,
  uuid,
} from 'drizzle-orm/pg-core';

import { evidenceTable } from 'src/evidence/evidence.table';

export const imageEvidenceTable = pgTable(
  'image_evidence',
  {
    activityId: uuid('activity_id').notNull(),
    evidenceNumber: integer('evidence_number').notNull(),
    linkToRelatedResource: text('link_to_related_resource'),
  },
  (imageEvidenceTable) => {
    return {
      primaryKey: primaryKey({
        columns: [
          imageEvidenceTable.activityId,
          imageEvidenceTable.evidenceNumber,
        ],
      }),
      evidenceForeignKey: foreignKey({
        columns: [
          imageEvidenceTable.activityId,
          imageEvidenceTable.evidenceNumber,
        ],
        foreignColumns: [
          evidenceTable.activityId,
          evidenceTable.evidenceNumber,
        ],
      })
        .onDelete('cascade')
        .onUpdate('cascade'),
    };
  },
);
