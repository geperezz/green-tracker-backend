import { pgTable, text, uuid, pgEnum } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['unit', 'admin', 'superadmin']);

export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: userRole('role').notNull(),
});
