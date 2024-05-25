import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: integer('id').primaryKey(), 
  contrasena: text('contrasena').notNull(),
  rol: text('rol').notNull(),
});
