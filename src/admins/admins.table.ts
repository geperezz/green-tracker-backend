import { pgTable, uuid } from 'drizzle-orm/pg-core';

import { usersTable } from 'src/users/users.table';

export const adminsTable = pgTable('admins', {
  id: uuid('id')
    .primaryKey()
    .references(() => usersTable.id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
});
